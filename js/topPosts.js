/*** topPosts.js
**
** file that creates the top posts -- no d3 here, just usual stuff
** data input format: list of posts, with each post as {company, postID, postDate, text, postLink, postSentimentScore}
***/

// function that sorts posts by sentiment score, highest to lowest
function sortPosts(postsList){

	postsList = postsList.sort(function(a, b){

		return Math.abs(parseFloat(b.postSentimentScore)) - Math.abs(parseFloat(a.postSentimentScore));
	})

	return postsList;
}

// function that creates the HTML elements for the posts onto the page
function addPosts(postsList, company){

	// find the object that represents this company
	for (comp in postsList){

		if(postsList[comp]['company'] == company){
			
			postsList = postsList[comp]['posts'];
			break;
		}
	}

	postsList = sortPosts(postsList);

	// cutoff to top 5 posts
	topPostList = [];
	for(var i = 0; i < 5; i++){
		topPostList.push(postsList[i]);
	}

	// find the parent element to append divs to
	var parent = $('#topPostsContent');

	// remove previous posts that might be there from other companies
	parent.empty();

	// add back in the title
	parent.append("<span class='card-title' id='postsTitle'>Top Posts</span>");

	// construct the div for each post
	topPostList.map(function(d, i){

		// process the text to escape characters
		var escapedText = d.body.replace(/'/g, "&apos;").replace(/"/g, "&quot;");

		// content is the div that we're going to append
		var content = "<div class='.childComment'>";

		// add score
		content += "<span> Score: " + d.postSentimentScore + ", </span >";

		// add linked text
		content += "<a href=" + d.link + " class='truncate'>" + escapedText + "</a>";

		// close content
		content += "</div>";

		// append post onto page
		parent.append(content);
	})
}
