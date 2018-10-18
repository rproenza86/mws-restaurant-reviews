const restaurants = [
    {
        "name": "Mission Chinese Food",
        "neighborhood": "Manhattan",
        "photograph": "1",
        "address": "171 E Broadway, New York, NY 10002",
        "latlng": {
            "lat": 40.713829,
            "lng": -73.989667
        },
        "cuisine_type": "Asian",
        "operating_hours": {
            "Monday": "5:30 pm - 11:00 pm",
            "Tuesday": "5:30 pm - 11:00 pm",
            "Wednesday": "5:30 pm - 11:00 pm",
            "Thursday": "5:30 pm - 11:00 pm",
            "Friday": "5:30 pm - 11:00 pm",
            "Saturday": "12:00 pm - 4:00 pm, 5:30 pm - 12:00 am",
            "Sunday": "12:00 pm - 4:00 pm, 5:30 pm - 11:00 pm"
        },
        "createdAt": 1504095563444,
        "updatedAt": "2018-10-16T01:59:12.189Z",
        "id": 1,
        "is_favorite": "false"
    },
    {
        "name": "Emily",
        "neighborhood": "Brooklyn",
        "photograph": "2",
        "address": "919 Fulton St, Brooklyn, NY 11238",
        "latlng": {
            "lat": 40.683555,
            "lng": -73.966393
        },
        "cuisine_type": "Pizza",
        "operating_hours": {
            "Monday": "5:30 pm - 11:00 pm",
            "Tuesday": "5:30 pm - 11:00 pm",
            "Wednesday": "5:30 pm - 11:00 pm",
            "Thursday": "5:30 pm - 11:00 pm",
            "Friday": "5:30 pm - 11:00 pm",
            "Saturday": "5:00 pm - 11:30 pm",
            "Sunday": "12:00 pm - 3:00 pm, 5:00 pm - 11:00 pm"
        },
        "createdAt": 1504095568414,
        "updatedAt": "2018-10-16T01:59:19.316Z",
        "is_favorite": "false",
        "id": 2
    },
    {
        "name": "Kang Ho Dong Baekjeong",
        "neighborhood": "Manhattan",
        "photograph": "3",
        "address": "1 E 32nd St, New York, NY 10016",
        "latlng": {
            "lat": 40.747143,
            "lng": -73.985414
        },
        "cuisine_type": "Asian",
        "operating_hours": {
            "Monday": "11:30 am - 2:00 am",
            "Tuesday": "11:30 am - 2:00 am",
            "Wednesday": "11:30 am - 2:00 am",
            "Thursday": "11:30 am - 2:00 am",
            "Friday": "11:30 am - 6:00 am",
            "Saturday": "11:30 am - 6:00 am",
            "Sunday": "11:30 am - 2:00 am"
        },
        "createdAt": 1504095571434,
        "updatedAt": "2018-10-16T02:03:36.916Z",
        "id": 3,
        "is_favorite": "false"
    },
    {
        "name": "Katz's Delicatessen",
        "neighborhood": "Manhattan",
        "photograph": "4",
        "address": "205 E Houston St, New York, NY 10002",
        "latlng": {
            "lat": 40.722216,
            "lng": -73.987501
        },
        "cuisine_type": "American",
        "operating_hours": {
            "Monday": "8:00 am - 10:30 pm",
            "Tuesday": "8:00 am - 10:30 pm",
            "Wednesday": "8:00 am - 10:30 pm",
            "Thursday": "8:00 am - 2:30 am",
            "Friday": "8:00 am - Sat",
            "Saturday": "Open 24 hours",
            "Sunday": "Sat - 10:30 pm"
        },
        "createdAt": 1504095567091,
        "updatedAt": 1504095567091,
        "is_favorite": false,
        "id": 4
    },
    {
        "name": "Roberta's Pizza",
        "neighborhood": "Brooklyn",
        "photograph": "5",
        "address": "261 Moore St, Brooklyn, NY 11206",
        "latlng": {
            "lat": 40.705089,
            "lng": -73.933585
        },
        "cuisine_type": "Pizza",
        "operating_hours": {
            "Monday": "11:00 am - 12:00 am",
            "Tuesday": "11:00 am - 12:00 am",
            "Wednesday": "11:00 am - 12:00 am",
            "Thursday": "11:00 am - 12:00 am",
            "Friday": "11:00 am - 12:00 am",
            "Saturday": "10:00 am - 12:00 am",
            "Sunday": "10:00 am - 12:00 am"
        },
        "createdAt": 1504095567071,
        "updatedAt": 1504095567071,
        "is_favorite": false,
        "id": 5
    },
    {
        "name": "Hometown BBQ",
        "neighborhood": "Brooklyn",
        "photograph": "6",
        "address": "454 Van Brunt St, Brooklyn, NY 11231",
        "latlng": {
            "lat": 40.674925,
            "lng": -74.016162
        },
        "cuisine_type": "American",
        "operating_hours": {
            "Monday": "Closed",
            "Tuesday": "12:00 pm - 10:00 pm",
            "Wednesday": "12:00 pm - 10:00 pm",
            "Thursday": "12:00 pm - 10:00 pm",
            "Friday": "12:00 pm - 11:00 pm",
            "Saturday": "12:00 pm - 11:00 pm",
            "Sunday": "12:00 pm - 9:00 pm"
        },
        "createdAt": 1504095567071,
        "updatedAt": 1504095567071,
        "is_favorite": false,
        "id": 6
    },
    {
        "name": "Superiority Burger",
        "neighborhood": "Manhattan",
        "photograph": "7",
        "address": "430 E 9th St, New York, NY 10009",
        "latlng": {
            "lat": 40.727397,
            "lng": -73.983645
        },
        "cuisine_type": "American",
        "operating_hours": {
            "Monday": "11:30 am - 10:00 pm",
            "Tuesday": "Closed",
            "Wednesday": "11:30 am - 10:00 pm",
            "Thursday": "11:30 am - 10:00 pm",
            "Friday": "11:30 am - 10:00 pm",
            "Saturday": "11:30 am - 10:00 pm",
            "Sunday": "11:30 am - 10:00 pm"
        },
        "createdAt": 1504095567091,
        "updatedAt": 1504095567091,
        "is_favorite": false,
        "id": 7
    },
    {
        "name": "The Dutch",
        "neighborhood": "Manhattan",
        "photograph": "8",
        "address": "131 Sullivan St, New York, NY 10012",
        "latlng": {
            "lat": 40.726584,
            "lng": -74.002082
        },
        "cuisine_type": "American",
        "operating_hours": {
            "Monday": "11:30 am - 3:00 pm, 5:30 pm - 11:00 pm",
            "Tuesday": "11:30 am - 3:00 pm, 5:30 pm - 11:00 pm",
            "Wednesday": "11:30 am - 3:00 pm, 5:30 pm - 11:00 pm",
            "Thursday": "11:30 am - 3:00 pm, 5:30 pm - 11:00 pm",
            "Friday": "11:30 am - 3:00 pm, 5:30 pm - 11:30 pm",
            "Saturday": "10:00 am - 3:00 pm, 5:30 pm - 11:30 pm",
            "Sunday": "10:00 am - 3:00 pm, 5:30 pm - 11:00 pm"
        },
        "createdAt": 1504095567091,
        "updatedAt": 1504095567091,
        "is_favorite": false,
        "id": 8
    },
    {
        "name": "Mu Ramen",
        "neighborhood": "Queens",
        "photograph": "9",
        "address": "1209 Jackson Ave, Queens, NY 11101",
        "latlng": {
            "lat": 40.743797,
            "lng": -73.950652
        },
        "cuisine_type": "Asian",
        "operating_hours": {
            "Monday": "5:00 pm - 10:00 pm",
            "Tuesday": "5:00 pm - 10:00 pm",
            "Wednesday": "5:00 pm - 10:00 pm",
            "Thursday": "5:00 pm - 10:00 pm",
            "Friday": "5:00 pm - 11:00 pm",
            "Saturday": "5:00 pm - 11:00 pm",
            "Sunday": "5:00 pm - 10:00 pm"
        },
        "createdAt": 1504095567191,
        "updatedAt": 1504095567191,
        "is_favorite": false,
        "id": 9
    },
    {
        "name": "Casa Enrique",
        "neighborhood": "Queens",
        "address": "5-48 49th Ave, Queens, NY 11101",
        "latlng": {
            "lat": 40.743394,
            "lng": -73.954235
        },
        "cuisine_type": "Mexican",
        "operating_hours": {
            "Monday": "5:00 pm - 12:00 am",
            "Tuesday": "5:00 pm - 12:00 am",
            "Wednesday": "5:00 pm - 12:00 am",
            "Thursday": "5:00 pm - 12:00 am",
            "Friday": "5:00 pm - 12:00 am",
            "Saturday": "11:00 am - 12:00 am",
            "Sunday": "11:00 am - 12:00 am"
        },
        "photograph": "5",
        "createdAt": 1504095567183,
        "updatedAt": "2018-10-11T18:10:18.197Z",
        "is_favorite": "true",
        "id": 10
    }
];

export default restaurants;