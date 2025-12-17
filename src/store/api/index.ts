/**
 * Central export file for all RTK Query APIs
 * Import APIs from here for consistency
 */

// Base APIs
export { baseApi, classApi as baseClassApi, workspaceApi } from './baseApi';

// Feature APIs
export * from './authApi';
export * from './classApi';
export * from './studentApi';
export * from './facultyApi';
export * from './organizationApi';
