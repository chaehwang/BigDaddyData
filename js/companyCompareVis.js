/**
	
	Company Compare Vis

	creates a single graph with two lines to compare the sentiments of companies for the company's trend in sentiment score over time

**/

CompanyCompareVis = function(_parentElement, _data, _companyList, _eventHandler){

    // set params
    this.parentElement = _parentElement;
    this.data = _data;
    this.companyList = _companyList;
    this.eventHandler = _eventHandler;

    // instantiate display data
    this.displayData = [];
    this.compareData = [];

    // define all "constants" here
    this.margin = {top: 40, right: 50, bottom: 20, left: 30},
    this.width = 720 - this.margin.left - this.margin.right,
    this.height = 400 - this.margin.top - this.margin.bottom;

    this.initVis();
}


/**
 * Method that sets up the SVG and the variables
 */
CompanyCompareVis.prototype.initVis = function(){

    var that = this;

    this.svg = this.parentElement.select("svg");

    // constructs SVG layout
    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // create scales and axes
	this.x = d3.time.scale()
					.range([0, this.width]);

	this.y = d3.scale.linear()
					.range([2*this.height/3, 0]);

	this.colorScale = d3.scale.category20();

	this.xAxis = d3.svg.axis()
						.orient('bottom')
						.scale(this.x)
						.ticks(5);

	this.yAxis = d3.svg.axis()
					.orient('left')
					.ticks(5)
					.scale(this.y);

	this.svg.append("g")
	  .attr("class", "x axis")
	  .attr("transform", "translate(0," + 2*this.height/3 + ")")

	this.svg.append("g")
	  .attr("class", "y axis")

	// Define the line to be drawn between points
	this.valueline = d3.svg.line()
					    .x(function(d) { return that.x(d.date); })
					    .y(function(d) { return that.y(d.score); });


    // filter, aggregate, modify data
    this.wrangleData();

    // call the update method
    this.updateVis();
}



/**
 * Method to wrangle the data
  */
CompanyCompareVis.prototype.wrangleData = function(){

	// set that for scope
	var that = this;

	var originalList = [];
    var compareList = [];
    var monthlyOriginalList = [];
    var monthlyCompareList = [];

    // create data parser
    var parseDate = d3.time.format("%Y-%m");

    if(this.compareCompany == "None"){
        this.compareData = [];
    }
    else{

        // find the index of this company
        var compareIndex = this.companyList.indexOf(that.compareCompany);
        if (compareIndex != -1)
            this.compareData = this.data[compareIndex];    
        else
            this.compareData = [];
    }

    var companyIndex = this.companyList.indexOf(that.company)

    if(companyIndex != -1)
        this.displayData = this.data[companyIndex].posts;
    else
        this.displayData = [];

    if(this.displayData.length > 0){

        // fill up companyList and compareList
        this.displayData.map(function(d, i){

            originalList.push({'date': d.postDate, 'score': d.postSentimentScore});
        })

        this.compareData.map(function(d, i){

            compareList.push({'date': d.postDate, 'score': d.postSentimentScore});
        })

        console.log(originalList);

        // find the monthly data for both original and compare
        originalList.map(function(d, i){

            // convert datestring to Date
            var dateObject = new Date(d.date)

            // find the month/year of this post and use the time format
            var monthString = dateObject.getFullYear() + "-" + dateObject.getMonth();

            console.log(d);

            var found = false; 

            // see if this month already exists. if so, update score. if not, create it. 
            for(monthIndex in monthlyOriginalList){

                var month = monthlyOriginalList[monthIndex];

                // if we've found the date, update the score
                if (month.postDate == monthString){

                    month.postSentimentScore += d.score;
                    found = true;
                    break;
                }
            }

            // if not found, then append an object for this month
            if(!found){

                monthlyOriginalList.push({
                    'postDate': monthString,
                    'postSentimentScore': 0
                })
            }

        });

        compareList.map(function(d, i){


        });

        console.log(monthlyOriginalList);



    }


    // set displayData to be scoreList since that's going to determine our bar values
    this.displayData = originalList;
    this.compareData = compareList;

    this.updateVis();

}



/**
 * the drawing function - should use the D3 selection, enter, exit
 * @param _options -- only needed if different kinds of updates are needed
 */
CompanyCompareVis.prototype.updateVis = function(){

	var that = this;

    // set domains for the scales -- x is date, y is score
	this.x.domain(d3.extent(this.displayData, function(d) { return d.date; }));
    this.y.domain([0, d3.max(this.displayData, function(d) { return d.score; })]);

    // updates axis
    this.svg.select(".x.axis")
        .call(this.xAxis);

    this.svg.select(".y.axis")
        .call(this.yAxis)

	 // Add the original valueline path.
    this.svg.append("path")
        .attr("class", "line-original")
        .attr("d", that.valueline(that.displayData));

    // Add the original scatterplot
    this.svg.selectAll("dot")
        .data(this.displayData)
      .enter().append("circle")
        .attr("r", 3.5)
        .attr("cx", function(d) { return that.x(d.date); })
        .attr("cy", function(d) { return that.y(d.score); });

    // if compare, then add that -- else, remove
    if(this.compareData.length > 0){
        
        // Add the compare path
        this.svg.append("path")
            .attr("class", "line-compare")
            .attr("d", that.valueline(that.compareData));

        this.svg.selectAll("dot")
            .data(this.compareData)
          .enter().append("circle")
            .attr("class", "compareDot")
            .attr("r", 3.5)
            .attr("cx", function(d) { return that.x(d.date); })
            .attr("cy", function(d) { return that.y(d.score); });        
    }

    else{
        d3.selectAll('.line-compare').remove();
        d3.selectAll('.compareDot').remove();
    }

}

/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 * @param selection
 */
CompanyCompareVis.prototype.onSelectionChange= function (company){


    // update company if changed
    if(company != ""){
        // update base company
        this.company = company;
        d3.select('#companyTitle').html(company);

        this.compareCompany = "None";

        // add the word cloud
        var wordCloud = "<img src='../img/" + company + ".png' class='valign' height='320' width='520'>";
        $('#wordCloudCard').html(wordCloud);
    }

    // update viz to reflect data
    this.wrangleData();




}

CompanyCompareVis.prototype.onCompareChange= function (company){


    // update compare company if changed
    this.compareCompany = company;

    // update data to add (or remove) comparison
    this.wrangleData();


}