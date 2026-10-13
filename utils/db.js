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

// Helper to parse Drizzle eq/condition expressions into PostgREST filters
function extractCondition(condition) {
  if (!condition) return null;

  // Direct properties if exposed
  if (condition.left?.name && condition.right !== undefined) {
    return { col: condition.left.name, val: condition.right };
  }
  if (condition.column?.name && condition.value !== undefined) {
    return { col: condition.column.name, val: condition.value };
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
      return { col, val };
    }
  }

  return null;
}

// Helper to parse Drizzle order expressions
function extractOrderBy(orderExp) {
  if (!orderExp) return { col: 'id', ascending: false };

  if (orderExp.column?.name) {
    const isDesc = orderExp.direction === 'desc' || Boolean(orderExp.order);
    return { col: orderExp.column.name, ascending: !isDesc };
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

    return { col, ascending: !isDesc };
  }

  return { col: 'id', ascending: false };
}

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