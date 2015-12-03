/**
	
	Sentiment Bar Graph (main page)

	Description: Object for the main sentiment bar graph to be shown on the main page
	Data input: [{company, totalSentimentScore}...]
	Output: 
		Horizontal bar graph, one bar for each company
		Ordered greatest to least in order of sentiment score
		Clicking on a bar results in loading the detailed view for that page

**/

SentimentBarVis = function(_parentElement, _data, _metaData, _eventHandler){

    // set params
    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
    this.eventHandler = _eventHandler;

    // instantiate display data
    this.displayData = [];

    // define all "constants" here
    this.margin = {top: 20, right: 40, bottom: 30, left: 30},
    this.width = 720 - this.margin.left - this.margin.right,
    this.height = 700 - this.margin.top - this.margin.bottom;

    this.initVis();
}


/**
 * Method that sets up the SVG and the variables
 */
SentimentBarVis.prototype.initVis = function(){

    var that = this;

    this.svg = this.parentElement.select("svg");

    // constructs SVG layout
    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // create scales and axes
	this.x = d3.scale.linear()
					.range([0,600]);

	this.y = d3.scale.ordinal()
					.rangeRoundBands([0, this.height/2], .2);

	this.colorScale = d3.scale.category20();

	this.xAxis = d3.svg.axis()
						.orient('bottom')
						.scale(this.x);

	this.yAxis = d3.svg.axis()
					.orient('left')
					.tickFormat('')
					.scale(this.y);

    // filter, aggregate, modify data
    this.wrangleData();

    // call the update method
    this.updateVis();
}



/**
 * Method to wrangle the data
  */
SentimentBarVis.prototype.wrangleData = function(){

	// set that for scope
	var that = this;

    // process the given data to be in the format that we want
    this.companyList = [];
    this.scoreList = [];

    // separate the data into companyList and scoreList
    this.data.map(function(d, i){

    	that.companyList.push(d.company);
    	that.scoreList.push(d.score);
    })

    // set displayData to be scoreList since that's going to determine our bar values
    this.displayData = this.scoreList;

}



/**
 * the drawing function - should use the D3 selection, enter, exit
 * @param _options -- only needed if different kinds of updates are needed
 */
SentimentBarVis.prototype.updateVis = function(){

	var that = this;

	var barHeight = 50;

    // set domains for the scales -- x is score, y is company
    this.x.domain([0, d3.max(this.displayData)]);
	this.y.domain(d3.range(this.displayData.length));

    // updates axis

    // add the chart
	var chart = this.svg.append('g')
						.attr("transform", "translate(0,0)")
						.attr('id','bars')
						.selectAll('rect')
						.data(this.displayData)
						.enter()
						// .append('a')
						// .attr('xlink:href', '')
						.append('rect')
						.attr('height', barHeight)
						.attr({'x':0, 'y':function(d,i){ return that.y(i)}})
						.style('fill', this.colorScale)
						.attr('width', 0)
						.on('mouseover', function(d, i){

							d3.selectAll('rect')
								.style("fill", function(d2, i2){

									if(i2 == i){
										return "red"
									}

									else{
										return "#8c8c8c";
									}


								});

							d3.selectAll('#companyLabel')
								.style('fill', function(d2, i2){


									if(i2 == i){
										return "black"
									}

									else{
										return "#8c8c8c";
									}

								})
						})
						.on('mouseout', function(){
							d3.selectAll('rect')
								.style("fill", that.colorScale);

							d3.selectAll('#companyLabel')
								.style('fill', "black");
						})
						.on('click', function(d, i){

							console.log(that.companyList[i]);

							$(that.eventHandler).trigger('selectCompany', that.companyList[i]);
							$('#sentimentBarGraph').toggleClass('transitionLeftOut');
							$('#companyPage').toggleClass('transitionRightIn');
						});

	this.svg.append("g")
	  .attr("class", "x axis")
	  .attr("transform", "translate(0," + this.height/2 + ")")

	this.svg.append("g")
	  .attr("class", "y axis")
	  
    this.svg.select(".x.axis")
        .call(this.xAxis);

    this.svg.select(".y.axis")
        .call(this.yAxis)


	// transition bars
	var transit = d3.select("svg").selectAll("rect")
					    .data(this.displayData)
					    .transition()
					    .duration(1000) 
					    .attr("width", function(d) {return that.x(d); });

	// transition text
	var transitext = d3.select('#bars')
						.selectAll('text')
						.data(this.companyList)
						.enter()
						.append('text')
						.attr("id", "companyLabel")
						.attr("x", function(d, i){ return that.x(that.displayData[i]) + 5; })
						.attr("y", function(d, i){ return that.y(i) + barHeight/2 + 4; })
						.text(function(d){ return d;});


}

/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 * @param selection
 */
SentimentBarVis.prototype.onSelectionChange= function (selectionStart, selectionEnd){

    // TODO: call wrangle function
    this.wrangleData();


}