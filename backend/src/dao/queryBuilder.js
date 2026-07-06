class QueryBuilder { 
    constructor(fieldMap) { 
        this.$fieldMap = fieldMap
    }

    insert(table, params) { 
        const columns = []
        const values = []

        let i = 1

        for (const [key, value] of Object.entries(params)) {
            if (!value) continue

            const dbkey = this.$fieldMap[key]

            if (!dbkey) continue

            columns.push(dbkey)
            values.push(`$${i++}`)
        }

        const sql = `
            INSERT INTO ${table}(${columns.join(', ')})
            VALUES (${values.join(', ')})
        `
        return sql
    }

    update(table, userId, params) {
        const sets = []

        let i = 1

        for (const [key, value] of Object.entries(params)) { 
            if (!value) continue

            const dbkey = this.$fieldMap[key]

            if (!dbkey) continue

            sets.push(`${dbkey} = $${i++}`)
        }

        const sql = `
            UPDATE ${table}
            SET ${sets.join(', ')}
            WHERE ${this.$fieldMap.userId} = $${i}
        `

        return sql
    }
}

module.exports = QueryBuilder