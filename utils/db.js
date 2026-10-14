import { createClient } from './supabase/client.js';
import { MockInterview, UserAnswer } from './schema.js';

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

// Helper to parse Drizzle eq/condition expressions into PostgREST filters
function extractCondition(condition) {
  if (!condition) return null;

  // Direct properties if exposed
  if (condition.left?.name && condition.right !== undefined) {
    let col = condition.left.name;
    if (col === 'mockIdRef') col = 'mockId';
    return { col, val: condition.right };
  }
  if (condition.column?.name && condition.value !== undefined) {
    let col = condition.column.name;
    if (col === 'mockIdRef') col = 'mockId';
    return { col, val: condition.value };
  }

  // Drizzle SQL queryChunks structure
  if (Array.isArray(condition.queryChunks)) {
    let col = null;
    let val = undefined;

    for (const chunk of condition.queryChunks) {
      if (chunk?.name) {
        col = chunk.name;
      } else if (chunk?.column?.name) {
        col = chunk.column.name;
      }

      if (chunk?.value !== undefined && !Array.isArray(chunk.value)) {
        val = chunk.value;
      }
    }

    if (col && val !== undefined) {
      if (col === 'mockIdRef') col = 'mockId';
      return { col, val };
    }
  }

  return null;
}

// Helper to parse Drizzle order expressions
function extractOrderBy(orderExp) {
  if (!orderExp) return { col: 'id', ascending: false };

  if (orderExp.column?.name) {
    let col = orderExp.column.name;
    if (col === 'mockIdRef') col = 'mockId';
    const isDesc = orderExp.direction === 'desc' || Boolean(orderExp.order);
    return { col, ascending: !isDesc };
  }

  if (Array.isArray(orderExp.queryChunks)) {
    let col = 'id';
    let isDesc = false;

    for (const chunk of orderExp.queryChunks) {
      if (chunk?.name) col = chunk.name;
      if (
        chunk?.value &&
        Array.isArray(chunk.value) &&
        chunk.value.some((s) => typeof s === 'string' && s.toLowerCase().includes('desc'))
      ) {
        isDesc = true;
      }
    }

    if (col === 'mockIdRef') col = 'mockId';
    return { col, ascending: !isDesc };
  }

  return { col: 'id', ascending: false };
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
            const parsed = extractCondition(condition);
            if (parsed) {
              queryState.filters.push({ type: 'eq', col: parsed.col, val: parsed.val });
            }
            return builder;
          },
          orderBy: (orderExp) => {
            const parsed = extractOrderBy(orderExp);
            if (parsed) {
              queryState.orderCol = parsed.col;
              queryState.ascending = parsed.ascending;
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

    const normalizeRow = (row) => {
      if (!row || typeof row !== 'object') return row;
      const copy = { ...row };
      if (copy.mockIdRef !== undefined) {
        if (copy.mockId === undefined) {
          copy.mockId = copy.mockIdRef;
        }
        delete copy.mockIdRef;
      }
      return copy;
    };

    return {
      values: (valuesObj) => {
        let returnCols = null;
        const normalizedPayload = Array.isArray(valuesObj)
          ? valuesObj.map(normalizeRow)
          : normalizeRow(valuesObj);

        const execute = async () => {
          try {
            const supabase = getClient();
            let query = supabase.from(tableName).insert(normalizedPayload);

            if (returnCols) {
              query = query.select(returnCols);
            }

            const { data, error } = await query;
            if (error) {
              console.warn(`Supabase insert error on ${tableName}:`, error.message);
              return returnCols ? [{ mockId: normalizedPayload?.mockId }] : null;
            }

            return data || (returnCols ? [{ mockId: normalizedPayload?.mockId }] : null);
          } catch (e) {
            console.warn(`Database insert failed on ${tableName}:`, e?.message);
            return returnCols ? [{ mockId: normalizedPayload?.mockId }] : null;
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

  delete: (table) => {
    const tableName = getTableName(table);
    let filter = null;

    const execute = async () => {
      try {
        const supabase = getClient();
        let query = supabase.from(tableName).delete();
        if (filter) {
          query = query.eq(filter.col, filter.val);
        }
        const { data, error } = await query;
        if (error) {
          console.warn(`Supabase delete error on ${tableName}:`, error.message);
          return null;
        }
        return data || true;
      } catch (e) {
        console.warn(`Database delete failed on ${tableName}:`, e?.message);
        return null;
      }
    };

    const deleteBuilder = {
      where: (condition) => {
        const parsed = extractCondition(condition);
        if (parsed) {
          filter = { col: parsed.col, val: parsed.val };
        }
        return deleteBuilder;
      },
      then: (onfulfilled, onrejected) => execute().then(onfulfilled, onrejected),
      catch: (onrejected) => execute().catch(onrejected),
    };

    return deleteBuilder;
  },
};

export const getSupabase = () => getClient();