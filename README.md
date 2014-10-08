# 'Situation Room' Map

Map to display realtime sentiment-processed results of searches across Social Machines. For now it just uses the Twitter streaming API. Datasift integration has been tried and would work. NodeJS app based on [safesoftware's GitHub repo](https://github.com/safesoftware/twitter-streaming-nodejs/) using [Sentimental](https://github.com/thinkroth/Sentimental) and hosted on [Heroku](https://www.heroku.com).

### Usage

Visit it online at http://situation-room-map.herokuapp.com
Control search term from URL, e.g. http://situation-room-map.herokuapp.com/?search=morning
Hide search box control (e.g. For using in iFrame), e.g. http://situation-room-map.herokuapp.com/?search=morning&hide=true

### History

#### v0.1

Basic Twitter map with heat maps for positive and negative sentitment
Search box and URL search param
