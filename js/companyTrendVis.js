/**
	
	Sentiment Bar Graph (main page)

	Description: Object for the main sentiment bar graph to be shown on the main page
	Data input: [{company, totalSentimentScore}...]
	Output: 
		Horizontal bar graph, one bar for each company
		Ordered greatest to least in order of sentiment score
		Clicking on a bar results in loading the detailed view for that page

**/

CompanyTrendVis = function(_parentElement, _data, _metaData, _eventHandler){

    // set params
    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
    this.eventHandler = _eventHandler;

    // instantiate display data
    this.displayData = [];

    // define all "constants" here
    this.margin = {top: 40, right: 40, bottom: 20, left: 30},
    this.width = 720 - this.margin.left - this.margin.right,
    this.height = 400 - this.margin.top - this.margin.bottom;

    this.initVis();
}


/**
 * Method that sets up the SVG and the variables
 */
CompanyTrendVis.prototype.initVis = function(){

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
CompanyTrendVis.prototype.wrangleData = function(){

	// set that for scope
	var that = this;

	var dateList = []

    // create data parser
    var parseDate = d3.time.format("%Y-%m");

    // separate the data into companyList and scoreList
    this.data.map(function(d, i){

    	dateList.push({'date': parseDate.parse(d.postDate), 'score': d.postSentimentScore});
    })

    // set displayData to be scoreList since that's going to determine our bar values
    this.displayData = dateList;

}



/**
 * the drawing function - should use the D3 selection, enter, exit
 * @param _options -- only needed if different kinds of updates are needed
 */
CompanyTrendVis.prototype.updateVis = function(){

	var that = this;

	console.log(this.displayData);

    // set domains for the scales -- x is score, y is company
	this.x.domain(d3.extent(this.displayData, function(d) { return d.date; }));
    this.y.domain([0, d3.max(this.displayData, function(d) { return d.score; })]);

    // updates axis
    this.svg.select(".x.axis")
        .call(this.xAxis);

    this.svg.select(".y.axis")
        .call(this.yAxis)

	 // Add the valueline path.
    this.svg.append("path")
        .attr("class", "line")
        .attr("d", that.valueline(that.displayData));

    // Add the scatterplot
    this.svg.selectAll("dot")
        .data(this.displayData)
      .enter().append("circle")
        .attr("r", 3.5)
        .attr("cx", function(d) { return that.x(d.date); })
        .attr("cy", function(d) { return that.y(d.score); });
}

/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 * @param selection
 */
CompanyTrendVis.prototype.onSelectionChange= function (company){

    // update company value and re-wrangle data
    this.company = company;
    d3.select('#companyTitle').html(company);


}