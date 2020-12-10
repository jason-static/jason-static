export const crossObject = (obj) => {
    return Object.keys(obj).reduce((acc, key) => {
        return [
            ...obj[key].reduce((iAcc, value) => {
                if (acc.length > 0) {
                    return [
                        ...iAcc,
                        ...acc.map(existing => ({
                            ...existing,
                            ...{[key]: value}
                        }))
                    ]
                }
                return [...iAcc, {[key]: value}]
            }, [])
        ]
    }, [])
}
