[Link to original](https://lantern.mediahist.org/api)

# Lantern API Access

Lantern now includes basic functionality to interact programmatically with search queries, results, and individual item details. By making a `GET` request to a specific URL, you can retrieve information about MHDL collection items in a structured JSON format.

This is very basic functionality based on Blacklight's [implementation of JSON-API](https://github.com/projectblacklight/blacklight/wiki/JSON-API). We do not provide any additional API access beyond these very basic requests. Additionally, we do not provide official support for accessing Lantern via these methods.

## Access Limits and Restrictions

Requesting data in JSON format via these endpoints does not require prior authorization. You are welcome to use these URLs within your own scripts to work programmatically with the MHDL collections. However, please be mindful that automated use may impact the experience for other users. To that end, we ask that you please limit your requests to no more than 10 requests/second. We believe that this strikes an appropriate balance between providing enhanced scripted access to the Lantern search and ensuring that the general public can still access the MHDL holdings as expected.

If you have a project in mind that will necessitate exceeding this rate limit, please get in touch with us at mhdl@commarts.wisc.edu to discuss your plans.

## Other API Access to the MHDL Collections

Lantern is designed to provide full-text search of every scanned page within the MHDL collection. Before building an application that interacts with these API endpoints, it may be worth considering whether this is the best means for you to access the MHDL holdings. If you need to search the actual text content and work with individual pages, then using Lantern is probably your best option. But if you just need to search broadly across the collections and work with whole volumes (e.g. full magazines, pressbooks, trade journals) then it may be more useful for you to use the [MHDL Collection](https://archive.org/details/mediahistory) on the Internet Archive and use [their APIs](https://archive.org/services/docs/api/) instead.

---

## Queries

To perform and automated Lantern query, make a `GET` request to `http://lantern.mediahist.org/catalog.json?q=QUERY+TEXT+HERE`.

Use the `?q=` parameter to specify your query. Don't forget to URL encode any special characters within your request to avoid errors.

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

### Creating Queries

All of the facets (e.g. date, title, author, publisher, etc.) that are available on the website interface are available to use when creating an API query. These can be added as URL parameters within the HTTP GET request that your application sends to the server.

One easy way to create your request URL is to first use the website interface to fine-tune the search query and facets that you'd like to use. Then, you can copy the URL and add `.json` after `https://lantern.mediahist.org/catalog/...` so that it now reads `https://lantern.mediahist.org/catalog.json/...`. You can use this URL within your application to parse the raw search results for the query that you created.

## Item Details

To retrieve information about a specific page, make a `GET` request to `https://lantern.mediahist.org/catalog/PAGE_ID/raw.json`.

Replace PAGE_ID with the id of an individual item, which you can find using the "Queries" API endpoint outlined above.

Lantern will return a JSON response with full information about the specified page. Of particular interest may be the `body` attribute, which will include the raw OCR text of the particular page. This may be useful for interacting with the text scans in an automated fashion

### Sample JSON Response

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