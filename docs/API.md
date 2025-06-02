# Magic Lantern API Reference

## Lantern API Endpoints

### Search Endpoint

`GET https://lantern.mediahist.org/catalog.json`

Parameters:
- `keyword`: Primary search term
- `second_keyword`: Additional term (AND operator)
- `third_keyword`: Third term (AND operator)
- `search_field`: "advanced"
- `op`: "AND" (operator between keywords)
- `sort`: "score desc, dateStart desc"
- `per_page`: Results per page (default: 20)
- `f_inclusive[collection][]`: Collection filters
- `f_inclusive[format][]`: Format filters (usually "Periodicals")
- `range[year][begin]`: Start year for date range
- `range[year][end]`: End year for date range


Lantern will return a JSON response with your search results. The response will contain several sections:

- Links
    - Search results are paginated, and you can use the values in the links section to request next page(s) in your search results.
    
    ```
    "links": {
	"self": "http://lantern.mediahist.org/catalog.json?q=QUERY+TEXT+HERE",
	"next": "http://lantern.mediahist.org/catalog.json?page=2&q=QUERY+TEXT+HERE",
	"last": "http://lantern.mediahist.org/catalog.json?page=56661&q=QUERY+TEXT+HERE"
    },

    ```

    - Self: represents the current URL that you requested
    - Next: represents the URL to request the next page of results.
    - Last: represents the URL to request the last page of results

- Meta

    - Provides metadata about the number of pages of search results that are available for you to request.

    ```"meta": {
        "pages": {
            "current_page": 1,
            "next_page": 2,
            "prev_page": null,
            "total_pages": 56661,
            "limit_value": 10,
            "offset_value": 0,
            "total_count": 566606,
            "first_page?": true,
            "last_page?": false
        }
    },
    ```	

- Data

    ```
    "data": [
            {
                "id": "varietyradiod19381939vari_0480",
                "type": null,
                "attributes": {
                    "id": {
                        "id": "http://lantern.mediahist.org/catalog/varietyradiod19381939vari_0480#id",
                        "type": "document_value",
                        "attributes": {
                            "value": "<a href=\"catalog/varietyradiod19381939vari_0480\">Details and Download Information	</a>",
                            "label": "Item Details"
                        }
                    },
                    "read": {
                        "id": "http://lantern.mediahist.org/catalog/varietyradiod19381939vari_0480#read",
                        "type": "document_value",
                        "attributes": {
                            "value": "<a href=\"http://archive.org/stream/varietyradiod19381939vari#page/n479/\">Read this page in Context</a>",
                            "label": "Full Page"
                        }
                    },
                    "read_search_highlighting": {
                        "id": "http://lantern.mediahist.org/catalog/varietyradiod19381939vari_0480#read_search_highlighting",
                        "type": "document_value",
                        "attributes": {
                            "value": "<a href=\"http://archive.org/stream/varietyradiod19381939vari#page/n479/mode/2up/search/radio\">Read in Context with Search Highlighted</a>",
                            "label": "Highlighting"
                        }
                    },
                    "dbUpdateDate": {
                        "id": "http://lantern.mediahist.org/catalog/varietyradiod19381939vari_0480#dbUpdateDate",
                        "type": "document_value",
                        "attributes": {
                            "value": "April 07, 2022",
                            "label": "Date Added"
                        }
                    },
                    "body": {
                        "id": "http://lantern.mediahist.org/catalog/varietyradiod19381939vari_0480#body",
                        "type": "document_value",
                        "attributes": {
                            "value": "PROGRAM  TITLES— Continued \nRadio  Doghouse  Club \n(WCOP) Radio  Drama  Guild  Presents, The",
                            "label": "Exceprt"
                        }
                    }
                },
                "links": {
                    "self": "http://lantern.mediahist.org/catalog/varietyradiod19381939vari_0480"
                }
            },
            { ... }
    ]
    ```
   - Contains the actual search results and basic attributes (similar to what is displayed on the HTML results page)
    - id: use the id field to request full details about a specific page using the "Item Details" endpoint
    - attributes: contains further values (and URLs) to access on Internet Archive or via the Lantern interface
    - body: Displays the brief excerpt from the OCR text that matched the search query

- Included
    - Facets
        - Returns information about the search facets that are available for the returned search query. This can be useful for retrieving metadata such as the number of results that match a particular year, for example.
    - Sort
        - Returns information about the available sort methods for the search query. You can use the returned links to make a new request with the search results sorted in a particular way



### Full Text Endpoint

`GET https://lantern.mediahist.org/catalog/{item_id}/raw.json`

Returns complete page data including:
- `body`: Full OCR text
- `collection`: Array of collections
- `year`: Publication year
- `creator`: Publisher/creator
- `read`: Internet Archive URL


#### Sample JSON Response for Full Text Endpoint

```
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
```