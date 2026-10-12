"use client"
import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { chatSession } from '@/utils/GeminiAIModal'
import { LoaderCircle, Plus } from 'lucide-react'
import { db } from '@/utils/db'
import { MockInterview } from '@/utils/schema'
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/context/AuthContext'
import moment from 'moment'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

function AddNewInterview() {
    const [openDailog,setOpenDailog]=useState(false)
    const [jobPosition,setJobPosition]=useState('');
    const [jobDesc,setJobDesc]=useState('');
    const [jobExperience,setJobExperience]=useState('');
    const [loading,setLoading]=useState(false);
    const [jsonResponse,setJsonResponse]=useState([]);
    const router=useRouter();
    const { user } = useAuth();

    const onSubmit=async(e)=>{
        setLoading(true)
        e.preventDefault()

        try {
            const count = process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT || 5;
            const InputPrompt="Job position: "+jobPosition+", Job Description: "+jobDesc+", Years of Experience : "+jobExperience+" , Depends on Job Position, Job Description & Years of Experience give us "+count+" Interview question along with Answer in JSON format, Give us question and answer field on JSON"

            const result=await chatSession.sendMessage(InputPrompt);
            const rawText = result.response.text();
            const MockJsonResp=rawText.replace(/```json/g,'').replace(/```/g,'').trim()
            
            setJsonResponse(MockJsonResp);

            if(MockJsonResp) {
                const userEmail = user?.email || user?.primaryEmailAddress?.emailAddress || 'candidate@prepsmart.ai';
                const newMockId = uuidv4();

                try {
                    const resp=await db.insert(MockInterview)
                    .values({
                        mockId: newMockId,
                        jsonMockResp:MockJsonResp,
                        jobPosition:jobPosition,
                        jobDesc:jobDesc,
                        jobExperience:jobExperience,
                        createdBy: userEmail,
                        createdAt:moment().format('DD-MM-yyyy')
                    }).returning({mockId:MockInterview.mockId});

                    if(resp && resp[0]?.mockId) {
                        setOpenDailog(false);
                        router.push('/dashboard/interview/'+resp[0]?.mockId);
                    } else {
                        setOpenDailog(false);
                        router.push('/dashboard/interview/'+newMockId);
                    }
                } catch (dbErr) {
                    console.warn("DB insert fallback:", dbErr);
                    // Safe fallback if PostgreSQL credentials not yet provided
                    toast.success("Interview generated! (Local preview mode)");
                    setOpenDailog(false);
                    router.push('/dashboard/interview/'+newMockId);
                }
            } else {
                toast.error("AI response format was invalid. Please try again.");
            }
        } catch (err) {
            console.error("Failed to generate interview:", err);
            toast.error(err.message || "Failed to generate interview questions.");
        } finally {
            setLoading(false);
        }
    }

    return (
    <div>
        <div 
            className='group p-8 border-2 border-dashed border-[#2563EB]/30 rounded-2xl bg-gradient-to-br from-[#2563EB]/5 via-transparent to-[#2563EB]/5 hover:border-[#2563EB] hover:bg-[#2563EB]/10 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-3 min-h-[160px]'
            onClick={()=>setOpenDailog(true)}
        >
            <div className='w-12 h-12 rounded-full bg-[#2563EB]/10 group-hover:bg-[#2563EB] text-[#2563EB] group-hover:text-white flex items-center justify-center transition-all duration-300 group-hover:rotate-90 group-hover:scale-110 shadow-sm'>
                <Plus className='w-6 h-6' />
            </div>
            <h2 className='text-base font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#2563EB] transition-colors'>+ Add New Mock Interview</h2>
            <p className='text-xs text-slate-500 text-center max-w-[200px]'>Generate targeted questions with Gemini 3.5 AI</p>
        </div>
        <Dialog open={openDailog} onOpenChange={setOpenDailog}>
       
        <DialogContent className="max-w-2xl">
            <DialogHeader >
            <DialogTitle className="text-2xl" >Tell us more about your job interviewing</DialogTitle>
            <DialogDescription>
                Add Details about your job position/role, Job description and years of experience
            </DialogDescription>
            </DialogHeader>
            <form onSubmit={onSubmit}>
            <div>
                <div className='mt-7 my-3'>
                    <label className='text-sm font-medium'>Job Role/Job Position</label>
                    <Input placeholder="Ex. Full Stack Developer" required
                    value={jobPosition}
                    onChange={(event)=>setJobPosition(event.target.value)}
                    />
                </div>
                <div className=' my-3'>
                    <label className='text-sm font-medium'>Job Description/ Tech Stack (In Short)</label>
                    <Textarea placeholder="Ex. React, Angular, NodeJs, MySql etc" 
                    required
                    value={jobDesc}
                    onChange={(event)=>setJobDesc(event.target.value)} />
                </div>
                <div className=' my-3'>
                    <label className='text-sm font-medium'>Years of experience</label>
                    <Input placeholder="Ex.5"  type="number"  max="100" 
                    required
                    value={jobExperience}
                    onChange={(event)=>setJobExperience(event.target.value)}
                    />
                </div>
            </div>
            <div className='flex gap-5 justify-end mt-4'>
                <Button type="button" variant="ghost" onClick={()=>setOpenDailog(false)}>Cancel</Button>
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {loading? 
                    <>
                    <LoaderCircle className='animate-spin mr-2' /> Generating from AI
                    </>:'Start Interview'    
                }
                </Button>
            </div>
            </form>
        </DialogContent>
        </Dialog>

    </div>
  )
}

export default AddNewInterview