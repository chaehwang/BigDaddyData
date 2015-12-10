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
    this.width = 720 - this.margin.left - this.margin.right,
    this.height = 400 - this.margin.top - this.margin.bottom;

    this.initVis();
}


/**
 * Method that sets up the SVG and the variables
 */
CompanyScoreBreakdownVis.prototype.initVis = function(){

    var that = this;

    this.svg = this.parentElement.select("svg");

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
            console.log(d.postSentimentScore);
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

    this.x = d3.scale.linear()
        .domain([d3.min(this.displayData), d3.max(this.displayData)])
        .range([0, that.width]);
    console.log(this.displayData)
    // generate the histogram
    this.histogramData = d3.layout.histogram()
                        
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
        .attr("width", 20)
        .attr("height", function(d){ return that.height/1.2 - that.y(d.y); })

    bar.append("text")
        .attr("dy", "0em") 
        .attr("dx", ".6em")
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
        var wordCloud = "<img src='../img/" + company + ".png' height='280' width='500'>";
        $('#wordCloudHere').append(wordCloud);
    }

    // update viz to reflect data
    this.wrangleData();




}