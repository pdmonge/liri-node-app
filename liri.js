var Twitter = require('twitter');
var twitterKeys = require('./keys.js');


var action = process.argv[2];

 
function showTweets() {
	var client = new Twitter(twitterKeys);
	var params = {screen_name: 'PmAlias'};
	client.get('statuses/user_timeline', params, function(error, tweets, response) {
	  if (!error) {
			console.log(tweets);
	  	tweets.map();
	  }
	});
}

action = 'my-tweets'; // Temporary for testing

switch (action) {
	case 'my-tweets':
		// Show last 20 tweets
		showTweets();
		break;
	case 'spotify-this-song':
		/*  Show in terminal:
					Artist(s)
					The song's name
					A preview link of the song from Spotify
					The album that the song is from

					If no song is provided then your program will default to "The Sign" by Ace of Base. */
		break;
	case 'movie-this':
		/* This will output the following information to your terminal/bash window:

			   * Title of the movie.
			   * Year the movie came out.
			   * IMDB Rating of the movie.
			   * Rotten Tomatoes Rating of the movie.
			   * Country where the movie was produced.
			   * Language of the movie.
			   * Plot of the movie.
			   * Actors in the movie.

				If the user doesn't type a movie in, the program will output data for the movie 'Mr. Nobody.' */
		break;
	case 'do-what-it-says':
		// LIRI will take the text inside of random.txt and then use it to call one of LIRI's commands.
		break;
	default:
		console.log('Invalid action requested')
}