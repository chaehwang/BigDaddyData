/**
	
	Company Score Breakdown Vis

	Creates a histogram of the scores that posts received. Also updates the values for title of page and size/revenue

**/

CompanyScoreBreakdownVis = function(_parentElement, _data, _companyList, _eventHandler){

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
    this.width = $(this.parentElement).width() - this.margin.left - this.margin.right,
    this.height = 400 - this.margin.top - this.margin.bottom;

    this.initVis();
}


/**
 * Method that sets up the SVG and the variables
 */
CompanyScoreBreakdownVis.prototype.initVis = function(){

    var that = this;

    this.svg = this.parentElement.select("svg");

    this.colorScale = d3.scale.category20();

    // constructs SVG layout
    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // filter, aggregate, modify data
    this.wrangleData();
}



/**
 * Method to wrangle the data
  */
CompanyScoreBreakdownVis.prototype.wrangleData = function(){

    // find the data for only this company
    var thisData = [];
    var thisIndex = this.companyList.indexOf(this.company);

    if(thisIndex != -1){

        // map over the posts for this company
        this.data[thisIndex]['posts'].map(function(d, i){
            thisData.push(d.postSentimentScore);
        })

        this.displayData = thisData;

        this.updateVis();
    }

}



/**
 * the drawing function - should use the D3 selection, enter, exit
 * @param _options -- only needed if different kinds of updates are needed
 */
CompanyScoreBreakdownVis.prototype.updateVis = function(){

    this.svg.selectAll(".bar").remove();
    this.svg.selectAll(".x axis").remove();
    this.svg.selectAll("g").remove()
	var that = this;

    var xmax = Math.max(-d3.min(this.displayData), d3.max(this.displayData));

    // make sure that we have some sort of graph even if we just have scores of 0
    if(xmax == 0){

        xmax = 1;
    }

    // adjust xmax for scaling purposes
    xmax += 0.5;

    this.x = d3.scale.linear()
        .domain([-xmax, xmax])
        .range([0, that.width])
        .nice();

    // generate the histogram
    this.histogramData = d3.layout.histogram()
                            .bins(that.x.ticks(10))
                            (this.displayData);

    this.y = d3.scale.linear()
                .domain([0, d3.max(that.histogramData, function(d){ return d.y; })])
                .range([that.height/1.2, 0]);

    this.xAxis = d3.svg.axis()
                    .scale(that.x)
                    .orient("bottom");

    // make the bars
    var bar = this.svg.selectAll(".bar")
                .data(that.histogramData)
                .enter().append('g')
                    .attr('class', 'bar')
                    .attr('transform', function(d){ return "translate(" + that.x(d.x) + "," + that.y(d.y) + ")"; });

    bar.append("rect")
        .attr("x", 1)
        .attr("width", that.x(that.histogramData[0].x + that.histogramData[0].dx) - 1)
        .attr("height", function(d){ return that.height/1.2 - that.y(d.y); })
        .style('fill', this.colorScale)

    bar.append("text")
        .attr("dy", "0em") 
        .attr("y", -10)
        .attr("x", that.x(that.histogramData[0].x + that.histogramData[0].dx)/2)
        .attr("text-anchor", "middle")
        .text(function(d){ if(d.y!= 0) return d.y; })

    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + that.height/1.2 + ")")
        .call(that.xAxis);

}

/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 * @param selection
 */
CompanyScoreBreakdownVis.prototype.onSelectionChange= function (company){


    // update company if changed
    if(company != ""){
        // update base company
        this.company = company;
        d3.select('#companyTitle').html(company);

        this.compareCompany = "None";

        // add the word cloud
        $('#wordCloudImage').attr("src", 'img/' + company+".png");
    }

    // update viz to reflect data
    this.wrangleData();




}