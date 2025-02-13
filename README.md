# DHBW DB Implementierungen

## Setup

### From Docker Hub
- Pull with `docker pull sarcaustech/dhbw-db-implementierungen:latest`
- Run with `docker run --rm -p 80:80 sarcaustech/dhbw-db-implementierungen:latest` (the app wil be available at http://localhost)
- Use in Dockerfile with `FROM sarcaustech/dhbw-db-implementierungen:latest`

### From source code
1. [Install Docker](https://docs.docker.com/get-docker/)
2. Open terminal in project directory
3. `docker build -t dhbw-db-implementierungen:latest .`
4. `docker run --rm -p 80:80 dhbw-db-implementierungen:latest`
5. The app will be available at http://localhost

## How to use
### Tree setup
To change the order of the tree set "Max. elements" to the desired value. This controls how many **values** one node can hold (maximum: maxElements, minimum: floor(maxElements / 2). All other metrics will be derived from this.

### Insert
#### **Single value**
Enter the desired value in the "Insert/delete" input field and click "Insert".

#### **Multiple values**
Enter the desired values as a comma separated list in the "Insert/delete" input field and click "Insert".

#### **CSV**
Select a file in the "Upload CSV" input field and click "Import CSV". A modal will open showing you the values which will be inserted. Confirm or cancel the insert operation to finish the action. Only the first column will be read. Multiple columns in one row as well as invalid characters (A-Z, special characters, ...) will be ignored.

Sample CSV file:
```
1
2
3
4
```

#### **Random values**
Select "Random min", "Random max" and "Random count" to insert "Random count" values ranging between "Random min" and "Random max".

### Delete
#### **Single value**
Enter the desired value in the "Insert/delete" input field and click "Delete".
#### **Multiple values**
Enter the desired values as a comma separated list in the "Insert/delete" input field and click "Delete".

### Search
Enter the desired search value in the "Search" input field and click "Search". A modal will open showing you the search value, if the value was found or not (true/false), the node in which the value was found (if applicable) and the number of nodes accessed during the search (steps).

### View history
With the table on the right you will be able to view a previous version of the tree. This is especially useful when inserting/deleting multiple values. Note that insert/delete operations will be performed on the newest version of the tree, regardless of the step you are currently viewing.
