# Changelog

Semua perubahan yang signifikan dalam proyek ini akan didokumentasikan di sini.

## [1.0.7] - 2023-12-05
## Tambah
- Added droppedIterations, This property is used to track the number of iterations that were abandoned or dropped due to failure
- Added droppedIterationsDetails, This property is used to store dropped iteration details, such as URLs, methods, data, and authentication information
- Added incrementDroppedIterations(details), This method adds the number of dropped iterations and saves the iteration details.
- Added durationTest, This parameter adds the test duration to the calculated metric.
- Added Loading Animation, To provide visual feedback during execution, a loading animation was added during testing
- Update Added error handling for unexpected content types and error messages displayed only once.

## [1.0.6] - 2023-11-29
## Tambah
- Added error handle when the server has reached its connection limit and is refusing new connections
- Added runIcanWithArrivalRate, details are in the readme
- Update can be used for http or https

## [1.0.5] - 2023-11-28
## Tambah
- Added sleepIcan : Suspend Virtual User execution for the specified duration. exp : sleepIcan(5000); "Sleep for 5 seconds or sleepIcan"(5000 * 30000); "Sleep for a random duration between 5 and 30 seconds"
- Added authentication method : basic, bearer, custom authentication
- Added error handle when testing and server connection is lost

## [1.0.4] - 2023-11-22
## Tambah
- Added breakpoint test function : to find out system limitations (To adjust or maintain weak points of the system to move higher limits to higher levels & To help plan remediation steps in such cases and prepare when the system approaches those limits)

## [1.0.3] - 2023-11-20
### Tambah
- Added metrics sentDataSize dan receivedDataSize
- Added thresholds http_req_failed dan http_req_duration

## [1.0.2] - 2023-11-19
### Tambah
- Runner update

## [1.0.1] - 2023-11-19
### Tambah
- Updated documentation

### Perbaiki
- Performance related bug fixes

## [1.0.0] - 2023-11-18
### Tambah
- Amazing early version of the project!
- Basic features have been implemented such as: HTTP Methods Support, Virtual Users, Metrics and Analysis, Checks and Validations and Thresholds and Exit Conditions

