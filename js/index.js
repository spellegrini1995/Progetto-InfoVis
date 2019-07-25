    	d3.json("meals.json").then( function(dataset){
    		d3.json("areas.json").then(function(areas){
    			d3.json("categories.json").then(function(categories){
    	
    	/*setAreaAndCategory(area, category) restituisce un array in cui:
    	- nella prima posizione c'è l'elenco dei piatti (nodi_piatto);
    	- nella seconda psizione c'è l'elenco degli ingredienti (nodi_ingredienti);
    	- nella terza posizione c'è un struttura JSON per gli archi piatti-ingredienti (edge_graph) del tipo 
    	  {"sorgente": "nome_piatto", "destinazione": "nome_ingrediente"}; */
    	function setAreaAndCategory(area, category){
    		var piatto;
    		var nodi_piatto = [];
    		var set_nodi_ingredienti = new Set();
    		var edge_graph = [];
    		
    		var result = [];
    		dataset.forEach(function(value, index) {
    			Object.keys(value).forEach(function(v, i) {
    				piatto = value[v];
    				var ingredienti;
    				var tmp;
    				if(piatto.area == area && piatto.category == category){
    					nodi_piatto.push(piatto.name);
    					ingredienti = piatto.ingredients;
    					for(var i = 0; i<ingredienti.length; i++){
    						tmp = {"sorgente":piatto.name,
    							   "destinazione":ingredienti[i]};
    						edge_graph.push(tmp);
    						set_nodi_ingredienti.add(ingredienti[i]);
    					}
    				}
    			})
    		});
    		var nodi_ingredienti = Array.from(set_nodi_ingredienti);
    		result[0] = nodi_piatto;
    		result[1] = nodi_ingredienti;
    		result[2] = edge_graph;
    		return result;
    		//	console.log(result);
    	}

    	

    	var margin = {top: 115, right: 100, bottom: 100, left: 100},
    	width = 800;
    	height = 350;

    	var svg = d3.select("#chart1").append("svg")
    	.attr("width", width + margin.left + margin.right)
    	.attr("height", height + margin.top + margin.bottom)
    	.style("margin-left", -margin.left + "px")
    	.append("g")
    	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    	svg.append("rect")
    	.attr("class", "background")
    	.attr("width", width)
    	.attr("height", height);

    	var numrows = areas.length;
    	var numcols = categories.length;

    	var matrix = new Array(numrows);
    	for (var i = 0; i < numrows; i++) {
    	matrix[i] = new Array(numrows);
    	for (var j = 0; j < numcols; j++) {
    	matrix[i][j] = Math.random()*2 - 1;
    	}
    	}

    	var x = d3.scaleBand()
    	.domain(d3.range(numcols))
    	.range([0, width])
        .paddingInner(0.02)
        .paddingOuter(0.03);

    	var y = d3.scaleBand()
    	.domain(d3.range(numrows))
    	.range([0, height])
        .paddingInner(0.02)
        .paddingOuter(0.05);



    	var rowLabels = new Array(numrows);
    	for (var i = 0; i < numrows; i++) {
    	rowLabels[i] = areas[i];
    	}

    	var columnLabels = new Array(numcols);
    	for (var i = 0; i < numcols; i++) {
    	columnLabels[i] = categories[i];
    	}

    	var colorMap = d3.scaleLinear()
    	.domain([-1, 0, 1])
    	//.range(["red", "white", "blue"]);    
    	.range(["brown", "#ddd", "darkgreen"]);

    	var row = svg.selectAll(".row")
    	.data(matrix)
    	.enter().append("g")
    	.attr("class", "row")
    	.attr("transform", function(d, i) { return "translate(0," + y(i) + ")"; });

    	var cell = row.selectAll(".cell")
    	.data(function(d,i,j) { return d;})
    	.enter().append("rect")
    	.attr("class", "cell")
    	.attr("x", function(d, i) { return x(i); })
    	.attr("width", x.bandwidth())
    	.attr("height", y.bandwidth())
    	.style("stroke-width", 4)

    	row.append("line")
    	.attr("x2", width);

    	row.append("text")
    	.attr("x", -5)
    	.attr("y", y.bandwidth() / 2)
    	.attr("dy", ".32em")
    	.attr("text-anchor", "end")
    	.attr("font-weight",600)
    	.text(function(d, i) { return areas[i]; });

    	var column = svg.selectAll(".column")
    	.data(columnLabels)
    	.enter().append("g")
    	.attr("class", "column")
    	.attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

    	column.append("line")
    	.attr("x1", -width);

    	column.append("text")
    	.attr("x", 5)
    	.attr("y", x.bandwidth() / 2)
    	.attr("dy", ".32em")
    	.attr("text-anchor", "start")
    	.attr("font-weight",600)
    	.text(function(d, i) { return d; });

    	// define tooltip
    	var tooltip = d3.select('#chart1') 
    	.append('div')                                   
    	.attr('class', 'tooltip'); 

    	tooltip.append('div')                           
    	.attr('class', 'area');                        
    	tooltip.append('div')                   
    	.attr('class', 'categoria');   
    	tooltip.append('div')                   
    	.attr('class', 'piatti');
    	tooltip.append('div')                   
    	.attr('class', 'ingredienti');                     
    	
    	row.selectAll(".cell")
    	.data(function(d, i) { return matrix[i]; })
    	.style("fill", colorMap)
    	.on('click', function(d,i,j) {
            var h = Array.prototype.indexOf.call(j[i].parentNode.parentNode.childNodes,j[i].parentNode) - 1;
    		var category = categories[i];
    		var area = areas[h];
    		var result = setAreaAndCategory(area, category);
    		if(result[0].length>0 && result[1].length>0){
    			var value1=area;
    			var value2=category;
    			var queryString = "?para1=" + value1 + "&para2=" + value2;
    			//window.location.href = "graph.html" + queryString;
    			window.open("graph.html"+queryString,"_blank");
    		}
    		else alert("Attenzione: hai selezionato un filtro in cui non sono presenti nè piatti nè ingredienti!");

    	})
    	.on('mouseover', function(d,i,j){
        var h = Array.prototype.indexOf.call(j[i].parentNode.parentNode.childNodes,j[i].parentNode) - 1;
        //console.log(j);
    	var res = setAreaAndCategory(areas[h], categories[i]);
    	var piat = res[0].length + "";                                             
    	var ing = res[1].length + "";                                             
    	tooltip.select('.area').html('Area: '+areas[h].bold());        
    	tooltip.select('.categoria').html('Categoria: '+categories[i].bold());    
    	tooltip.select('.piatti').html('Piatti: '+piat.bold());    
    	tooltip.select('.ingredienti').html('Ingredienti: '+ing.bold());    
    	tooltip.style('display', 'block');                    
    	})
    	.on('mouseout', function() {                     
    	tooltip.style('display', 'none'); 
    	})
    	.on('mousemove', function(d) { 
    	tooltip.style('top', (d3.event.layerY + 10) + 'px') 
    	.style('left', (d3.event.layerX + 10) + 'px'); 
    	})
    	.on("mouseenter", function(d) {
        d3.select(this)
           .style("stroke-width", 2)
           .attr("stroke","white")
           .transition()
    	})
    	.on("mouseleave", function(d) {
        d3.select(this).transition()            
           .attr("d", cell)
           .attr("stroke","none");
    	})
    	})
    	})
    	});

    		
    		
    	
    	

