/**
	
	Company Compare Vis

	creates a single graph with two lines to compare the sentiments of companies for the company's trend in sentiment score over time

**/

CompanyCompareVis = function(_parentElement, _data, _metaData, _eventHandler){

    // set params
    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
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

	var companyList = [];
    var compareList = [];

    // create data parser
    var parseDate = d3.time.format("%Y-%m");

    var testCompare = [{'postDate': '2015-05', 'postSentimentScore': 20}, 
                        {'postDate': '2015-06', 'postSentimentScore': 40},
                        {'postDate': '2015-07', 'postSentimentScore': 60},
                        {'postDate': '2015-08', 'postSentimentScore': 80},
                        {'postDate': '2015-09', 'postSentimentScore': 70} ];


    // TODO: some js to get the name of the company selected so our data is dynamic
    var selectedCompany = $('#companyCompareSelect').val();

    console.log(selectedCompany);

    if(selectedCompany == "None"){
        this.compareData = [];
    }
    else{
        this.compareData = testCompare;    
    }
    

    // fill up companyList and compareList
    this.data.map(function(d, i){

    	companyList.push({'date': parseDate.parse(d.postDate), 'score': d.postSentimentScore});
    })

    this.compareData.map(function(d, i){

        compareList.push({'date': parseDate.parse(d.postDate), 'score': d.postSentimentScore});
    })


    // set displayData to be scoreList since that's going to determine our bar values
    this.displayData = companyList;
    this.compareData = compareList;

    this.updateVis();

}



/**
 * the drawing function - should use the D3 selection, enter, exit
 * @param _options -- only needed if different kinds of updates are needed
 */
CompanyCompareVis.prototype.updateVis = function(){

	var that = this;

    // set domains for the scales -- x is score, y is company
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
    if(typeof company !== "undefined"){
        // update base company
        this.company = company;
        d3.select('#companyTitle').html(company);
    }

    // update data to add (or remove) comparison
    this.wrangleData();


}