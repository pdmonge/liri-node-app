// External Node packages
const fs = require('fs');
const Twitter = require('twitter');
const twitterKeys = require('./keys.js');
const moment = require('moment');
const Spotify = require('node-spotify-api');
const spotify = new Spotify({
	id : 'a9ed76a68e56416fa7e296179180180d',
  secret : 'f5d7381bfbcb49e1a6ec319f742aa4ed'
});
const request = require('request');

// Global Settings
const omdbApiKey = '40e9cece';
const maxTweets = 20;
var userChoice;
var userAction;

// Capture command line parameters
var userParams = process.argv;
let paramLen = userParams.length;
if (paramLen>2) {
	userAction = userParams[2];
}
if (paramLen > 3) {
	userChoice = userParams.slice(3,paramLen).join(' ');
}

/*
	Sorts a list of tweets by created_at date
	tweetList must be an array of tweet objects with a created_at property
	in the format 'ddd MMM DD HH:mm:ss +SSSS YYYY'
	if sortOrder is 'descending' (not case sensitive) then the array will
	be sorted accordingly.  If sortOrder is any other value or undefined
	the array will be sorted in ascending order.
	Note:  This sorts the original array.
*/
function sortTweets(tweetList,sortOrder) {
	var result;
	var sortNum;
	if (sortOrder.toLowerCase() === 'descending') {
		sortNum = -1;
	} else {
		sortNum = 1;
	}

	tweetList.sort((tweet1,tweet2) => {
		var time1 = moment(tweet1.created_at,'ddd MMM DD HH:mm:ss +SSSS YYYY');
		var time2 = moment(tweet2.created_at,'ddd MMM DD HH:mm:ss +SSSS YYYY');
		if (time1.isAfter(time2)) {
			result = 1 * sortNum;
		} else if (time1.isBefore(time2)) {
			result = -1 * sortNum;
		}	else {
			result = 0;
		}
		return result;
	});
}

// Retrieve and display the most recent tweets up to the
// maximum amount specified in maxTw
function showTweets(maxTw) {
	var client = new Twitter(twitterKeys);
	var twitParams = {screen_name: 'PmAlias'};
	client.get('statuses/user_timeline', twitParams, function(error, tweets, response) {
	  if (!error) {
			tweets = tweets.concat(tweets,tweets,tweets,tweets,tweets);
			console.log(tweets.length);
			// Limit to the most recent <maxTw> tweets
			if (tweets.length > maxTw) {
				// Sort in reverse date order to get most recent at the top
				sortTweets(tweets,'descending');
				// Keep the most recent tweets up to maxTw
				tweets = tweets.slice(0,maxTw);
			}
			// Sort in date order
			sortTweets(tweets,'ascending');
			
	  	for (var i=0,len=tweets.length;i<len;i++) {
				console.log(
					moment(tweets[i].created_at,'ddd MMM DD HH:mm:ss +SSSS YYYY')
					.format('MM/DD/YYYY hh:mm:ss A'),' ',tweets[i].text);
			}
	  }
	});
}

function showSongInfo(aSong) {
	if (!aSong.preview_url){aSong.preview_url='None Available'}
	console.log(
		`-------------------------------------------\n`+
		`Artist: ${aSong.artists[0].name}\n`+
		`Song Title: ${aSong.name}\n`+
		`Preview Link: ${aSong.preview_url}\n`+
		`Album: type: ${aSong.album.type}, name: ${aSong.album.name}\n`
	);
}

function spotifyThisSong(aSongName) {
	console.log(
		`-------------------------------------------\n`+
		`Searched for Song: ${aSongName}`
	);
	// This requests data for "The Sign" by "Ace of Base" using an Spotify ID
	const defaultSongRequest = "https://api.spotify.com/v1/tracks/0hrBpAOgrt8RXigk83LLNE";
	/*
	Shows song information in terminal:
		Artist(s), The song's name,	A preview link of the song, Album that the song is from
	If no song is provided, defaults to "The Sign" by Ace of Base.
	*/
	if (!aSongName) { 
		spotify.request(defaultSongRequest)
		.then(function(data) {
			showSongInfo(data); 
		})
		.catch(function(err) {
			console.error('Error occurred: ' + err); 
		});
	} else {
		// Search tracks whose name, album or artist contains aSongName
		spotify
		.search({ type: 'track', query: aSongName })
		.then(function(response) {
			for (var i=0,len=response.tracks.items.length;i<len;i++) {
				showSongInfo(response.tracks.items[i]);
			}
		})
		.catch(function(err) {
			console.log(err);
		});
	}
}

function showMovieInfo(aMovie) {
	// Receives a JSON string from the OMDB API
	aMovieObj = JSON.parse(aMovie);
	console.log(`Title: ${aMovieObj.Title}`);
	console.log(`Year: ${aMovieObj.Year}`);
	console.log(`IMDB Rating: ${aMovieObj.imdbRating}`);
	let rottenTomatoesRating = aMovieObj.Ratings.filter((aRating) => aRating.Source = 'Rotten Tomatoes')[0].Value;
	console.log(`Rotten Tomatoes Rating: ${rottenTomatoesRating[0]}`);
	console.log(`Country: ${aMovieObj.Country}`);
	console.log(`Language: ${aMovieObj.Language}`);
	console.log(`Plot: ${aMovieObj.Plot}`);
	console.log(`Actors: ${aMovieObj.Actors}`);
	console.log('---------------------------------------------');	
}

function movieThis(aMovieName) {
	/* This will output the following information to your terminal/bash window:

				* Title of the movie.
				* Year the movie came out.
				* IMDB Rating of the movie.
				* Rotten Tomatoes Rating of the movie.
				* Country where the movie was produced.
				* Language of the movie.
				* Plot of the movie.
				* Actors in the movie.

			If the user doesn't type a movie in, the program will output data for the movie 'Mr. Nobody.'
	*/
	if (!aMovieName) {
		aMovieName = 'Mr. Nobody';
	}
	console.log('---------------------------------------------');
	console.log(`Searched for: ${aMovieName}`);
	console.log('---------------------------------------------');
	httpString = `http://www.omdbapi.com/?apikey=${omdbApiKey}&t=${aMovieName}`;
	request(httpString, function (error, response, body) {
		let bodyObj = JSON.parse(body);
		if (error) {
			// Print the error if one occurred
			console.log('error:', error); 
		} else if (bodyObj.Response === 'False') {
			console.log(`Error: ${bodyObj.Error}`);
			console.log('---------------------------------------------');
		}	else {
			showMovieInfo(body);
		}
	});
	
}

function doCommandFromFile() {
	let fileName = './random.txt';
	fs.readFile(fileName,function(err,data){
		if (err) {
			console.log(err);
		} else {
			fileContentsArray = data.toString().split(',');
			userAction = fileContentsArray[0];
			userChoice = fileContentsArray[1].replace(/\"/g,'');
			runLiri();
		}
	});
}

function runLiri() {
	switch (userAction) {
		case 'my-tweets':
			// Show last <maxTweets> tweets
			showTweets(maxTweets);
			break;
		case 'spotify-this-song':
			spotifyThisSong(userChoice);
			break;
		case 'movie-this':
			movieThis(userChoice);
			break;
		case 'do-what-it-says':
			// LIRI will take the text inside of random.txt and then use it to call one of LIRI's commands.
			doCommandFromFile();
			break;
		default:
			console.log('Invalid action requested')
	}
}

runLiri();