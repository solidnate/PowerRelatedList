Creates a lightning component for displaying related records on a record detail page.

See AppBuilder/Design for the description of the options.

PowerRelatedList is the original component, won't be making further additions there.

PowerRelatedList2 has been refactored to have a datatable subcomponent.  You pass it an array of records and a few variables, and you get a sortable datatable.

Query/Filtering is implemented at the PowerRelatedList2 level, not on the datatable itself.