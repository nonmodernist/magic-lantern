The MHDL now offers basic functionality to interact programmatically with search queries, results, and individual item details. By making a GET request to a specific URL, you can retrieve information about MHDL collection items in a structured format.

We do not provide any additional API access beyond these very basic requests. Additionally, we do not provide official support for accessing MHDL data via these methods.

Access Limits and Restrictions
Requesting data in JSON format via these endpoints does not require prior authorization. You are welcome to use these URLs within your own scripts to work programmatically with the MHDL collections. However, please be mindful that automated use may impact the experience for other users. To that end, we ask that you please limit your requests to no more than 10 requests/second. We believe that this strikes an appropriate balance between providing enhanced scripted access to the Lantern search and ensuring that the general public can still access the MHDL holdings as expected.

If you have a project in mind that will necessitate exceeding this rate limit, please get in touch with us at mhdl@commarts.wisc.edu to discuss your plans.


List Collection Content
The MHDL collections are a convenient way to browse our content. We've curated several collections of materials related to specific aspects of film, radio, and broadcasting. Each collection contains hand-picked publication titles along with all of their individual volumes. To retrieve a list of all volumes in a collection, make a GET request to https://mediahist.org/data/collection.php?collection=.

Use the ?collection= parameter to specify the name of the collection. Please note that collection names are case-sensitive. Books is not the same as books. Please check your queries carefully. Depending on your environment and programming language, you may need to URL-encode the name. If you omit this parameter, the request will fail.

You can get a list of all the collection names (including their capitalization and punctuation) by making a GET request to https://mediahist.org/data/collection-names.php

The request will return JSON-formatted data with the following metadata listed within docs

idWork - Unique identifier for the volume. Use this to retrieve more information, or append to https://archive.org/details/ to view on the Internet Archive.
volume - The name of the individual volume of the publication
https://mediahist.org/data/collection.php?collection=Iran

{
    "numFound": 467,
    "start": 0,
    "numFoundExact": true,
    "docs": [
        {
            "idWork": "cinema-tehran-1977-11-16",
            "volume": [
                "6th Edition Tehran International Film Festival (November 16, 1977)"
            ]
        },
        {
            "idWork": "sal1336-sh151",
            "volume": [
                "Cinema Star (March 2, 1958)"
            ]
        },
[...]
        {
            "idWork": "sal1336-sh133",
            "volume": [
                "Cinema Star (October 27, 1957)"
            ]
        }
    ]
}

            
List All Publications
To retrieve a list of every publication title contained within the MHDL, make a GET request to https://mediahist.org/data/list-publications.php. These titles are listed exactly as they appear in our database, making them useful for then retrieving lists of individual volumes of the publication.

https://mediahist.org/data/list-publications.php

[
    " Catalogue No. 104bis: Vues de voyages et explorations en projections lumineuses",
    " Georges Carette & Co - Catalog 1902: Fabrik f\u00fcr optische, mechanische, elektrische, physicalische Waren. Spielwaren, Lehrmittel",
[...]
    "[N.B.C trade releases].",
    "naeb-newsletter-1930-10"
]
            
List Issues of a Publication
Each publication in the MHDL may have one or more individual volumes associated with it. These may be individual issues of a magazine, or may be multiple issues that have been compiled into a single physical volume. This varies by publication. Once you have a publication title, you can use this URL to retrieve identifier strings for these individual volumes. To retrieve a list of recently added/updated volumes, make a GET request to https://mediahist.org/data/list-volumes.php?title=.

Use the ?title= parameter to specify the name of the publication. Please note that publication titles are case-sensitive. Radio stars is not the same as Radio Stars. Please check your queries carefully. Depending on your environment and programming language, you may need to URL-encode the title. If you omit this parameter, the request will fail.

The request will return JSON-formatted data with the following metadata listed within docs

idWork - Unique identifier for the volume. Use this to retrieve more information, or append to https://archive.org/details/ to view on the Internet Archive.
volume - The name of the individual volume of the publication
https://mediahist.org/data/list-volumes.php?title=Radio%20stars

{
    "numFound": 11,
    "start": 0,
    "numFoundExact": true,
    "docs": [
        {
            "idWork": "radiostars3419univ",
            "volume": [
                "Radio stars (Oct 1933-Sept 1934)"
            ]
        },
        {
            "idWork": "radiostars5619univ",
            "volume": [
                "Radio stars (Oct 1934-Sept 1935)"
            ]
        },
        {
            "idWork": "radiostars7819unse",
            "volume": [
                "Radio stars (Oct 1935-Sept 1936)"
            ]
        },
        {
            "idWork": "radiostars1112unse",
            "volume": [
                "Radio stars (Oct 1937-Sept 1938)"
            ]
        },
        {
            "idWork": "radiostars9101unse",
            "volume": [
                "Radio stars (Oct 1936-Sept 1937)"
            ]
        },
        {
            "idWork": "radiostars1331unse",
            "volume": [
                "Radio stars (Dec 1938)"
            ]
        },
        {
            "idWork": "radiostars2419unse",
            "volume": [
                "Radio stars (July 1933)"
            ]
        },
        {
            "idWork": "radiostars2219unse",
            "volume": [
                "Radio stars (May 1933)"
            ]
        },
        {
            "idWork": "radiostars1311unse",
            "volume": [
                "Radio stars (Oct 1938)"
            ]
        },
        {
            "idWork": "radiostars2319unse",
            "volume": [
                "Radio stars (June 1933)"
            ]
        }
    ]
}
            
Recent Additions
To retrieve a list of recently added/updated volumes, make a GET request to https://mediahist.org/data/recents.php.

Add a ?count= parameter to specify the number of volumes you'd like to retrieve. If you omit this parameter, a default value of 25 will be used.

The request will return JSON-formatted data with the following metadata listed within docs

idWork - Unique identifier for the volume. Use this to retrieve more information, or append to https://archive.org/details/ to view on the Internet Archive.
title - The name of the publications
dbUpdateDate - Timestamp for when the volume was updated in our database
volume - The name of the individual volume of the publication
https://mediahist.org/data/recents.php?count=1

{
    "numFound": 10404,
    "start": 0,
    "numFoundExact": true,
    "docs": [
        {
            "idWork": "radiostars2619unse",
            "title": "Radio stars",
            "dbUpdateDate": "2023-01-19T03:19:23.053Z",
            "volume": [
                "Radio stars (Sept 1933)"
            ]
        }
    ]
}
            
Individual Volume Details
Most of the above examples will return a limited amount of metadata for each item. If you'd like to retreive more information about an individual volume, you'll need an idWork identifier. To retrieve a list of recently added/updated volumes, make a GET request to https://mediahist.org/data/volume.php?idWork=.

Use the ?idWork= parameter to specify identifier of the volume that you'd like to retrieve information for. If you omit this parameter, the request will fail. It is currently only possible to retrieve data one volume at a time.

The request will return JSON-formatted data

https://mediahist.org/data/volume.php?idWork=radiostars2619unse

{
    "numFound": 1,
    "start": 0,
    "numFoundExact": true,
    "docs": [
        {
            "iaPage": "radiostars2619unse_0001",
            "pageID": "10746929",
            "idWork": "radiostars2619unse",
            "title": "Radio stars",
            "year": 1933,
            "creator": "Dell Publishing Co., Inc.",
            "publisher": "New York : Dell Publishing Co., Inc.",
            "date": "1933-09",
            "dateString": "Sept 1933",
            "dateStart": "1933-09-19T00:00:00Z",
            "dateEnd": "1933-12-31T23:23:59Z",
            "yearStart": "1933-01-31T23:23:59Z",
            "yearEnd": "1933-12-31T23:23:59Z",
            "language": "English",
            "sponsor": [
                "LYRASIS Members and Sloan Foundation"
            ],
            "contributor": "University of Maryland, College Park",
            "idAccess": "http:\/\/archive.org\/details\/radiostars2619unse",
            "body": "",
            "read": "http:\/\/archive.org\/stream\/radiostars2619unse#page\/n0\/",
            "location": "https:\/\/archive.org\/download\/radiostars2619unse",
            "hires": "https:\/\/archive.org\/download\/radiostars2619unse\/page\/leaf0001",
            "lowres": "https:\/\/archive.org\/download\/radiostars2619unse\/page\/leaf0001_s4",
            "leafNumber": "0001",
            "collection": [
                "Broadcasting & Recorded Sound"
            ],
            "dbUpdateDate": "2023-01-19T03:19:23.053Z",
            "volume": [
                "Radio stars (Sept 1933)"
            ],
            "subject": [
                "{\"Radio actors and actresses -- United States -- Biography -- Periodicals\",\"Radio personalities -- Periodicals.\"}"
            ],
            "id": "radiostars2619unse_0001",
            "_version_": 1755434139018854403,
            "coordinator": "Media History Digital Library"
        }
    ]
}
            
Full-Text Search
Lantern is the full-text search platform for the Media History Digital Library. It provides access to the MHDL collections on a page-by-page basis, and makes it possible to search for text within a publication, rather than only title and other metadata. There are several options for programatically interacting with Lantern.

Basic examples are included here. More detailed information is available at https://lantern.mediahist.org/api

Search Queries
To perform and automated Lantern query, make a GET request to http://lantern.mediahist.org/catalog.json?q=QUERY+TEXT+HERE.

Use the ?q= parameter to specify your query. Don't forget to URL encode any special characters within your request to avoid errors.

Page Details
To retrieve information about a specific page, make a GET request to https://lantern.mediahist.org/catalog/PAGE_ID/raw.json.

Example JSON response:


{
    "iaPage": "radioannual194200radi_1031",
    "pageID": "5756750",
    "idWork": "radioannual194200radi",
    "title": "The Radio Annual",
    "year": 1942,
    "publisher": "Radio Daily",
    "date": "1942",
    "dateString": "1942",
    "yearStart": "1942-01-01T23:23:59Z",
    "yearEnd": "1942-12-31T23:23:59Z",
    "format": "Annuals",
    "language": "eng",
    "sponsor": [
        "Library of Congress, Motion Picture, Broadcasting and Recorded Sound Division"
    ],
    "contributor": "Library of Congress, MBRS, Recorded Sound Section",
    "idAccess": "http://archive.org/details/radioannual194200radi",
    "body": "STHTIOnS  OF \nSOUTH  HmERICR \nm    \nARGENTINA \nCall Letters \nFrequency Kilocycles \nStation  Name  Location \nLV1   Radio   Graffigna      San  Juan      560 \nLV12   Radio  Aconquija      Tucuman       580 \nLS10   Radio  Calloa      Florida,  Buenos  Aires    590 \nLV3   Radio  Cordoba      Cordoba       620 \nLV6   Radio    Mendoza      Mendoza       630 \nLU4   Radio  Comodora  Rivadavia   Comodoro  Rivadavia,  Chubut  640 \nLS4   Radio  Portena    Ciudadela,  Buenos  Aires    670 \nLU12   Radio    Rio    Gallegos   Rio  Gallegos,  Santa  Cruz    680 \nLV4   Radio   San  Rafael   San  Rafael,  Mendoza    690 \nLSI   Radio   Municipal      Monte  Grande,  Buenos  Aires  710 \nLW7   Radio  Catamarca    Catamarca        730 \nLRA   Buenos  Aires     750 \nLT1   Radio  del  Rosario   Rosario,  Santa  Fe    780 \nLW1   Radio  Cultura    Cordoba       790 \nLV7   Radio  Tucuman      Tucuman       820 \nLR5   Radio  Excelsior      Monte  Grande,  Buenos  Aires  830 \nLT8   Radio  Rosario     Rosario,  Santa  Fe    840 \nLR6   Radio  Mitre     Hurlingham,  Buenos  Aires . .  870 \nLU2   Radio  Bahia  Blanca   Bahia  Blanca     900 \nLR2   Radio   Argentina      Banfield,  Buenos  Aires    910 \nLR3   Radio   Belgrano      Hurlingham,  Buenos  Aires . . .  950 \nLV2   Radio  Central     Cordoba       960 \nLV9   Radio  Provincia  de  Salta   Salta       970 \nLR4   Radio  Splendid    Rivadavia,  Buenos  Aires.  . . .  990 \nLT4   Radio  Misiones  Posadas   Posadas,  Misiones       1010 \nLS2   Radio  Fenix    Florida,  Buenos  Aires    1030 \nLR1   Radio   El  Mundo   San  Fernando,  Buenos  Aires.  1070 \nLT5   Radio   Chaco      Resistencia,  Chaco     1080 \nLV5   Radio  Los  Andes   San  Juan     1090 \nLU5   Radio   Neuquen      Neuquen       1130 \nLU3   Radio  del  Sud   Bahia  Blanca     1150 \nLT3   Radio  Sociedad  Rural  de  Crealistas. Rosario,  Santa  Fe    1160 \nLV11   Radio    del    Norte   Santiago  del  Estero    1170 \nLS2   Radio  Prieto      Florida,  Buenos  Aires    1190 \nLT9   Radio   Roca  Soler   Santa  Fe       1200 \nLV10   Radio  de  Cuyo   Heras,  Mendoza      1210 \nLT2   Radio  Stentor     Rosario,  Santa  Fe    1230 \nLU7   Radio  Gral.  San  Martin   Bahia  Blanca     1240 \nLU8   Santa  Rosa,  La  Pampa    1250 \nLT12   Santa  Fe    1260 \n1009 \nPower Watts \n10000 5000 6000 \n15000 \n10000 5000 \n12000 1000 1000 \n50000 1000 \n10000 \n10000 \n15000 2500 \n25000 3000 \n25000 5000 6000 \n90000 5000 1000 \n50000 1000 5000 \n50000 1500 1500 1000 \n10000 5000 2000 \n15000 1000 2500 \n15000 \n2500 \n500 \n1000 \n",
    "read": "http://archive.org/stream/radioannual194200radi#page/n1030/",
    "location": "https://archive.org/download/radioannual194200radi",
    "hires": "https://archive.org/download/radioannual194200radi/page/leaf0001031",
    "lowres": "https://archive.org/download/radioannual194200radi/page/leaf0001031_s4",
    "description": [
        ""
    ],
    "leafNumber": "0001031",
    "collection": [
        "Year Book",
        "Broadcasting & Recorded Sound"
    ],
    "dbUpdateDate": "2022-04-07T11:19:31.414Z",
    "volume": [
        "The Radio Annual, 1942"
    ],
    "subject": [
        "Radio-Directories"
    ],
    "id": "radioannual194200radi_1031",
    "_version_": 1733859380350156803,
    "coordinator": "Media History Digital Library"
}
      