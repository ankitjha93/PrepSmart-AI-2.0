import { createClient } from './supabase/client';
import { MockInterview, UserAnswer } from './schema';

// Helper to extract table name from Drizzle table or string
function getTableName(table) {
  if (typeof table === 'string') return table;
  if (table && table._ && table._.name) return table._.name;
  if (table === MockInterview) return 'mockInterview';
  if (table === UserAnswer) return 'userAnswer';
  return 'mockInterview';
}

function getClient() {
  return createClient();
}

/**
 * Universal Database Client for Supabase PostgreSQL
 * Provides Drizzle-compatible query builder syntax mapped directly to Supabase PostgREST
 */
export const db = {
  select: () => {
    return {
      from: (table) => {
        const tableName = getTableName(table);
        const queryState = {
          tableName,
          filters: [],
          orderCol: null,
          ascending: false,
        };

        const execute = async () => {
          try {
            const supabase = getClient();
            let query = supabase.from(queryState.tableName).select('*');

            for (const filter of queryState.filters) {
              if (filter.type === 'eq') {
                query = query.eq(filter.col, filter.val);
              }
            }

            if (queryState.orderCol) {
              query = query.order(queryState.orderCol, { ascending: queryState.ascending });
            }

            const { data, error } = await query;
            if (error) {
              console.warn(`Supabase select error on ${queryState.tableName}:`, error.message);
              return [];
            }
            return data || [];
          } catch (e) {
            console.warn(`Database select failed on ${queryState.tableName}:`, e?.message);
            return [];
          }
        };

        const builder = {
          where: (condition) => {
            if (condition) {
              // Drizzle eq(column, value) structure
              const colName = condition?.left?.name || condition?.column?.name || 'createdBy';
              const val = condition?.right ?? condition?.value;
              queryState.filters.push({ type: 'eq', col: colName, val });
            }
            return builder;
          },
          orderBy: (orderExp) => {
            if (orderExp) {
              const col = orderExp?.column?.name || 'id';
              const isDesc = orderExp?.direction === 'desc' || Boolean(orderExp?.order);
              queryState.orderCol = col;
              queryState.ascending = !isDesc;
            }
            return builder;
          },
          then: (onfulfilled, onrejected) => execute().then(onfulfilled, onrejected),
          catch: (onrejected) => execute().catch(onrejected),
        };

        return builder;
      },
    };
  },

  insert: (table) => {
    const tableName = getTableName(table);

    return {
      values: (valuesObj) => {
        let returnCols = null;

        const execute = async () => {
          try {
            const supabase = getClient();
            let query = supabase.from(tableName).insert(valuesObj);

            if (returnCols) {
              query = query.select(returnCols);
            }

            const { data, error } = await query;
            if (error) {
              console.warn(`Supabase insert error on ${tableName}:`, error.message);
              return returnCols ? [{ mockId: valuesObj.mockId }] : null;
            }

            return data || (returnCols ? [{ mockId: valuesObj.mockId }] : null);
          } catch (e) {
            console.warn(`Database insert failed on ${tableName}:`, e?.message);
            return returnCols ? [{ mockId: valuesObj.mockId }] : null;
          }
        };

        const insertBuilder = {
          returning: (retConfig) => {
            if (retConfig && typeof retConfig === 'object') {
              returnCols = Object.keys(retConfig).join(',');
            }
            return insertBuilder;
          },
          then: (onfulfilled, onrejected) => execute().then(onfulfilled, onrejected),
          catch: (onrejected) => execute().catch(onrejected),
        };

        return insertBuilder;
      },
    };
  },
};

export const getSupabase = () => getClient();