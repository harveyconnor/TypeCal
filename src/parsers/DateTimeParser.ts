import { SubParser } from './SubParser';
import { DateTime } from 'luxon';

export class DateTimeParser implements SubParser<Date> {
    public parse = (rawStr: string): Date => {
        const dateStr = rawStr.split(':');
        if (dateStr.length < 2) throw SyntaxError(`Cannot parse DateTime property: ${rawStr}, splitted length is ${dateStr.length}.`);
        if (rawStr.includes(';VALUE=DATE:')) {
            // Parse date-only scenario, e.g. something like "DTEND;VALUE=DATE:19980704"
            return DateTime.fromFormat(dateStr[dateStr.length - 1], 'yyyyMMdd').toJSDate();
        } else if (rawStr.includes('TZID')) {
            // If TZID exists, read timezone from TZID
            const tzid = rawStr.match(/(?<=TZID\=)(.*)(?=\:)/gm); // Take out the value between "TZID=" and ":"
            if (tzid === null) throw SyntaxError(`Cannot parse DateTime property: ${rawStr}, invalid TZID.`);
            const tzidStr = tzid[0].replace('-', '/'); // Replace some old-school TZID value like "US-Eastern"
            return DateTime.fromFormat(dateStr[dateStr.length - 1], "yyyyMMdddd'T'HHMMss")
                .setZone(tzidStr)
                .toJSDate();
        } else if (/\d+T\d+Z/.test(rawStr)) {
            // For most of the scenarios, e.g. DTSTART:19970714T133000Z
            return DateTime.fromFormat(dateStr[dateStr.length - 1], "yyyyMMdddd'T'HHMMss'Z'")
                .setZone('UTC')
                .toJSDate();
        } else {
            // For "floating timezone" scenarios e.g. DTSTART:19980116T061000
            return DateTime.fromFormat(dateStr[dateStr.length - 1], "yyyyMMdddd'T'HHMMss")
                .setZone('UTC')
                .toJSDate();
        }
    };

    public valueNames = ['DTEND', 'DUE', 'DTSTART', 'DURATION'];
}