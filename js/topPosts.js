/*** topPosts.js
**
** file that creates the top posts -- no d3 here, just usual stuff
** data input format: list of posts, with each post as {company, postID, postDate, text, postLink, postSentimentScore}
***/

var dummyData = [
	{'company': 'Dropbox', 'postID': 'cgfz4rs', 'postDate': '05/05/2015', 'text': 'hello, world!', 'postLink': 'https://www.reddit.com/r/technology/comments/21s1cd/how_dropbox_knows_when_youre_sharing_copyrighted/cgfz4rs', 'postSentimentScore': '89'},
	{'company': 'Dropbox', 'postID': 'cgfz4rs', 'postDate': '05/05/2015', 'text': 'hello, world!', 'postLink': 'https://www.reddit.com/r/technology/comments/21s1cd/how_dropbox_knows_when_youre_sharing_copyrighted/cgfz4rs', 'postSentimentScore': '90'},
	{'company': 'Dropbox', 'postID': 'cgfz4rs', 'postDate': '05/05/2015', 'text': 'hello, world!', 'postLink': 'https://www.reddit.com/r/technology/comments/21s1cd/how_dropbox_knows_when_youre_sharing_copyrighted/cgfz4rs', 'postSentimentScore': '71'},
	{'company': 'Dropbox', 'postID': 'cgfz4rs', 'postDate': '05/05/2015', 'text': 'hello, world!', 'postLink': 'https://www.reddit.com/r/technology/comments/21s1cd/how_dropbox_knows_when_youre_sharing_copyrighted/cgfz4rs', 'postSentimentScore': '72'},
	{'company': 'Dropbox', 'postID': 'cgfz4rs', 'postDate': '05/05/2015', 'text': 'hello, world!', 'postLink': 'https://www.reddit.com/r/technology/comments/21s1cd/how_dropbox_knows_when_youre_sharing_copyrighted/cgfz4rs', 'postSentimentScore': '93'},
];

// function that sorts posts by sentiment score, highest to lowest
function sortPosts(postsList){

	postsList = postsList.sort(function(a, b){

		return parseFloat(b.postSentimentScore) - parseFloat(a.postSentimentScore);
	})

	return postsList;
}

// function that creates the HTML elements for the posts onto the page
function addPosts(postsList){

	postsList = sortPosts(postsList);

	// find the parent element to append divs to
	var parent = $('#topPostsContent');

	// remove previous posts that might be there from other companies
	parent.empty();

	// add back in the title
	parent.append("<span class='card-title' id='postsTitle'>Top Posts</span>");

	// construct the div for each post
	postsList.map(function(d, i){

		// process the text to escape characters
		var escapedText = d.text.replace(/'/g, "&apos;").replace(/"/g, "&quot;");

		// content is the div that we're going to append
		var content = "<div class='.childComment'>";

		// add score
		content += "<span> Score: " + d.postSentimentScore + ", </span >";

		// add linked text
		content += "<a href=" + d.postLink + ">" + escapedText + "</a>";

		// close content
		content += "</div>";

		// append post onto page
		parent.append(content);
	})
}
