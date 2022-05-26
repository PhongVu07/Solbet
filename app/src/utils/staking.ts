export const formatLockPeriod = (period: number) => {
    if (period === 0) {
        return "0 day"
    } else {
        return `${period/(60*60*24)} day(s)`
    }
}