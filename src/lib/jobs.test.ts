import { describe, it, expect } from 'vitest';
import {
    filterJobs,
    formatPostedDate,
    getDepartments,
    getLocations,
    sortByNewest,
} from './jobs';
import type { Job } from '../types/job';

/**
 * Creates a job fixture for pure helper tests.
 *
 * @param slug - The stable role identifier.
 * @param postedDate - The role's ISO posting date.
 * @param department - The department that owns the role.
 * @param location - The location associated with the role.
 * @returns A job fixture.
 */
function makeJob(
    slug: string,
    postedDate: string,
    department = 'Technology',
    location = 'Remote',
): Job {
    return {
        slug,
        title: `Role ${slug}`,
        department,
        location,
        type: 'Full-time',
        remote: true,
        postedDate,
        summary: 'A role.',
    };
}

describe('sortByNewest', () => {
    it('orders jobs by posted date, newest first', () => {
        const jobs = [
            makeJob('a', '2027-01-01'),
            makeJob('b', '2027-03-15'),
            makeJob('c', '2027-02-10'),
        ];
        expect(sortByNewest(jobs).map((j) => j.slug)).toEqual(['b', 'c', 'a']);
    });

    it('does not mutate the input array', () => {
        const jobs = [makeJob('a', '2027-01-01'), makeJob('b', '2027-03-15')];
        const original = jobs.map((j) => j.slug);
        sortByNewest(jobs);
        expect(jobs.map((j) => j.slug)).toEqual(original);
    });
});

describe('filterJobs', () => {
    const jobs = [
        makeJob('frontend', '2027-03-15', 'Technology', 'Remote'),
        makeJob('platform', '2027-03-10', 'Technology', 'Vancouver'),
        makeJob('scientist', '2027-03-01', 'Research', 'Vancouver'),
    ];

    it('filters by department', () => {
        expect(filterJobs(jobs, { department: 'Technology' }).map((job) => job.slug)).toEqual([
            'frontend',
            'platform',
        ]);
    });

    it('filters by location', () => {
        expect(filterJobs(jobs, { location: 'Vancouver' }).map((job) => job.slug)).toEqual([
            'platform',
            'scientist',
        ]);
    });

    it('combines department and location filters with AND matching', () => {
        expect(
            filterJobs(jobs, { department: 'Technology', location: 'Vancouver' }).map(
                (job) => job.slug,
            ),
        ).toEqual(['platform']);
    });

    it('returns every job when filters are cleared', () => {
        expect(filterJobs(jobs, {}).map((job) => job.slug)).toEqual(
            jobs.map((job) => job.slug),
        );
    });

    it('returns an empty array when no roles match', () => {
        expect(
            filterJobs(jobs, { department: 'Research', location: 'Remote' }),
        ).toEqual([]);
    });

    it('does not mutate the input array', () => {
        const original = jobs.map((job) => job.slug);
        filterJobs(jobs, { department: 'Technology' });
        expect(jobs.map((job) => job.slug)).toEqual(original);
    });
});

describe('filter option helpers', () => {
    const jobs = [
        makeJob('frontend', '2027-03-15', 'Technology', 'Remote'),
        makeJob('platform', '2027-03-10', 'Technology', 'Vancouver'),
        makeJob('scientist', '2027-03-01', 'Research', 'Vancouver'),
    ];

    it('returns unique alphabetized departments', () => {
        expect(getDepartments(jobs)).toEqual(['Research', 'Technology']);
    });

    it('returns unique alphabetized locations', () => {
        expect(getLocations(jobs)).toEqual(['Remote', 'Vancouver']);
    });
});

describe('formatPostedDate', () => {
    it('formats an ISO date as a readable string', () => {
        expect(formatPostedDate('2027-01-05')).toBe('January 5, 2027');
    });

    it('returns the raw value when the date is unparseable', () => {
        expect(formatPostedDate('not-a-date')).toBe('not-a-date');
    });
});
