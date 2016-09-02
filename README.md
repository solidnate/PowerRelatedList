2 record page components in 1 repo !

General notes--there is no error handling at all yet.  If you're violating rules or making non-sense requests, you'll see it in the browser console (hopefully?), but not in the UI.

## PowerRelatedList

Creates a lightning component for displaying related records on a record detail page.

See AppBuilder/Design for the description of the options.

PowerRelatedList2 has been refactored to have a datatable subcomponent.  You pass it an array of records and a few variables, and you get a sortable datatable.

Query/Filtering is implemented at the PowerRelatedList2 level, not on the datatable itself.

## LightningFieldSection

Drag onto a record detail page.  Pick the fields that are editable, the column quantity you want, etc.

There's no save button--any change updates the database

Use the component in AppBuilder for more info

## Subcomponents for your hackery

* LightingDataTable: pass it an array of variables, and you'll get a styled, sortable datatable

* LightningFields: add quick-edit fields to anything with just attributes


