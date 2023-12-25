/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/search', 'N/file', './lib/papaparse.min'],

    (search, file, papa) => {

        const savedSearchId = 'customsearch_de_taf_ap_b6';
        const csvFileName = 'SavedSearchExport.csv';
        const csvFolderId = 146875;
        const csvDelimiter = '\r\n'

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {
            const savedSearchResults = getSavedSearchResults(loadSearch(savedSearchId));
            const csvLines = getCSVLines(savedSearchResults);

            const fileObj = file.create({
                name: csvFileName,
                fileType: file.Type.CSV,
                contents: '',
                folder: csvFolderId
            });

            csvLines.split(csvDelimiter).forEach(function (line) {
                fileObj.appendLine({
                    value: line
                });
            })

            fileObj.save();
        }

        const getCSVLines = (savedSearchResults) => {
            const papaConfig = {
                quotes: false, //or array of booleans
                quoteChar: '"',
                escapeChar: '"',
                delimiter: ",",
                header: true,
                newline: csvDelimiter,
                skipEmptyLines: false, //other option is 'greedy', meaning skip delimiters, quotes, and whitespace.
                columns: null //or array of strings
            }
            return papa.unparse(savedSearchResults, papaConfig);
        }

        const getSavedSearchResults = (savedSearch) => {
            const result = [];

            savedSearch.rows.forEach(savedSearchResult => {
                let object = {};

                savedSearch.columns.forEach(column => {
                    object[column.label] = savedSearchResult.getValue({name: column})
                });

                result.push(object)
            });

            return result;
        }

        const loadSearch = (searchId) => {
            const savedSearch = search.load({
                id : searchId,
            });

            let result = [];
            let count = 0;
            const pageSize = 1000;
            let start = 0;

            do {
                const resultSet = savedSearch.run().getRange({
                    start : start,
                    end : start + pageSize
                });

                result = result.concat(resultSet);
                count = resultSet.length;
                start += pageSize;

            } while (count === pageSize);

            return { columns: savedSearch.columns, rows: result};
        }

        return {execute}

    });
