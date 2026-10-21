/**
 * Pure, side-effect-free helpers for working with job postings.
 *
 * These operate on plain `Job[]` arrays (already loaded from the content
 * collection by the calling page) so they can be unit tested without the Astro
 * content runtime or a database.
 */
import type { Job } from '../types/job';

/** Criteria used to narrow a list of roles. */
export interface JobFilters {
    /** Matches roles assigned to this department. */
    department?: string;
    /** Matches roles based in this location. */
    location?: string;
}

/** Return jobs sorted by posted date, newest first (does not mutate input). */
export function sortByNewest(jobs: Job[]): Job[] {
    return [...jobs].sort(
        (a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime(),
    );
}

/**
 * Returns jobs matching the selected department and location without mutating
 * the input.
 *
 * @param jobs - The roles to filter.
 * @param filters - The optional department and location criteria.
 * @returns The matching roles in their original order.
 */
export function filterJobs(jobs: Job[], filters: JobFilters = {}): Job[] {
    return jobs.filter(
        (job) =>
            (!filters.department || job.department === filters.department) &&
            (!filters.location || job.location === filters.location),
    );
}

/**
 * Returns the unique role departments in alphabetical order.
 *
 * @param jobs - The roles from which to derive departments.
 * @returns The sorted department names.
 */
export function getDepartments(jobs: Job[]): string[] {
    return getUniqueSortedValues(jobs, (job) => job.department);
}

/**
 * Returns the unique role locations in alphabetical order.
 *
 * @param jobs - The roles from which to derive locations.
 * @returns The sorted location names.
 */
export function getLocations(jobs: Job[]): string[] {
    return getUniqueSortedValues(jobs, (job) => job.location);
}

/**
 * Derives unique string values from roles and orders them alphabetically.
 *
 * @param jobs - The roles from which to derive values.
 * @param getValue - Maps a role to its value.
 * @returns The sorted, unique values.
 */
function getUniqueSortedValues(
    jobs: Job[],
    getValue: (job: Job) => string,
): string[] {
    return [...new Set(jobs.map(getValue))].sort((first, second) =>
        first.localeCompare(second),
    );
}

/**
 * Format an ISO-8601 date as a human-readable posted date,
 * e.g. "January 5, 2027". Falls back to the raw value if unparseable.
 */
export function formatPostedDate(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return iso;
    }
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
    });
}
