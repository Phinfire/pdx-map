export class SimplifiedDate {
    
    public static fromYearMonthDayDotSeparated(dateString: string) {
        const parts = dateString.split(".");
        if (parts.length !== 3) {
            console.error(`Invalid date format: ${dateString}`);
            throw new Error("Invalid date format, expected 'YYYY.MM.DD'");
        }
        const [yearStr, monthStr, dayStr] = parts;
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10);
        const day = parseInt(dayStr, 10);
        return new SimplifiedDate(year, month, day);
    }
    
    static fromDate(date: Date) {
        return new SimplifiedDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
    }

    constructor(public readonly year: number, public readonly month: number, public readonly day: number) {
        if (year < 0 || month < 1 || month > 12 || day < 1 || day > 31) {
            throw new Error("Invalid date values: " + year + "-" + month + "-" + day);
        }
    }

    getDateWithShortenedMonthName() {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthName = monthNames[this.month - 1] || "???";
        return `${this.day} ${monthName} ${this.year}`;
    }
}