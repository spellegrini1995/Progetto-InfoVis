	d3.json("meals.json").then(function(dataset) {

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



		//prendo i dati dall'altra pagina html
		var queryString = decodeURIComponent(window.location.search);
		queryString = queryString.substring(1);
		var queries = queryString.split("&");
		var area = (queries[0].split("="))[1];
		var category = (queries[1].split("="))[1];

		//titolo dinamico
		d3.select(".title").html("Grafo "+area +" - "+category);

		//mi genero il filtro dal dataset
		var result = setAreaAndCategory(area,category);

		//crea il grafo a partire da result che è l'output della funzione setAreaAndCategory
		var selected_meals = result[0];
		var ingredients = result[1];
		var Edge_Graph = result[2]

		//diametro nodi e dimensioni linee
		var diametro_nodi=10;
		var dimensione_freccia = "0.5";
		var x_freccia = 5;
		var y_freccia = 3;
		var spessore_linea_raccordo = 0.4;
		if(ingredients.length >= 20 && ingredients.length <=45){
			diametro_nodi=5;
			x_freccia = 5;
			y_freccia = 3;
		} 
		if(ingredients.length == 65 ){
			diametro_nodi=3;
			x_freccia = 3;
			y_freccia = 1;
		} 
		if(ingredients.length ==45 || ingredients.length ==42){
			diametro_nodi=4;
			x_freccia = 3;
			y_freccia = 1;
		} 
		var larghezza_bordo = 990;
		var altezza_bordo = 501;
		var bodySelection = d3.select ("#chart2");

		var svgSelection = bodySelection.append("svg")
			.attr("width", larghezza_bordo)
	 		.attr("height", altezza_bordo)
			.style("border", "1px solid black")

		
		
			//disegno nodi in ordine dell'array areas
		var NodeData =[];
		
		var len_selected_meals = selected_meals.length;
		var len_selected_ingredients = ingredients.length;
		var xspacing;
		var yspacing;
		// la spaziatura tra nodi è determinata in base al rapporto tra ingredienti e piatti selezionati
		if (len_selected_meals >len_selected_ingredients/4){
			xspacing = (larghezza_bordo/3)/len_selected_meals;
			yspacing = (altezza_bordo/3)/len_selected_meals;
		}
		else{
			xspacing = (larghezza_bordo)/len_selected_ingredients;
			yspacing = (altezza_bordo)/len_selected_ingredients;
		}

		for (var i = 0; i < selected_meals.length; i++) {
			//mettiamo lo start x in mezzo a due nodi della diagonale
			var startx = (larghezza_bordo/3)+10;
			var starty = 340;
			NodeData.push({"cx": startx+(i*xspacing), "cy": starty-(i*yspacing), "radius": diametro_nodi, "color" : "red", "id":selected_meals[i]});
		}
		
		var indexToSplit = Math.round(ingredients.length/4);
		var first_ingredients_list = ingredients.slice(0, indexToSplit);
		var second_ingredients_list = ingredients.slice(indexToSplit,indexToSplit*2);
		var third_ingredients_list = ingredients.slice(indexToSplit*2,indexToSplit*3);
		var fourth_ingredients_list = ingredients.slice(indexToSplit*3);

		//disegno nodi in ordine dell'array ingredients
		for (var i = 0; i < first_ingredients_list.length; i++) {
			let startX_prima_diagonale = 15;
			let startY_prima_diagonale = starty-(yspacing/2)
			//in questo caso ingredienti e nodi non devo condividere l'ordinata
		    NodeData.push({"cx": startX_prima_diagonale+(i*xspacing), "cy": startY_prima_diagonale-(i*yspacing), "radius": diametro_nodi, "color" : "blue", "id":first_ingredients_list[i]});
		}
		for (var i=0; i<second_ingredients_list.length;i++){
			let startX_seconda_diagonale = startx+(xspacing/2);
			let startY_seconda_diagonale = (altezza_bordo/3)-10;
			//in questo caso devo far sì che ingredienti e nodi non condividano la ascissa
			NodeData.push({"cx": startX_seconda_diagonale+(i*xspacing), "cy": startY_seconda_diagonale-(i*yspacing), "radius": diametro_nodi, "color" : "blue", "id":second_ingredients_list[i]});
		}
		for (var i = 0; i < third_ingredients_list.length; i++) {
			let startX_terza_diagonale = startx+(xspacing/2);
			let startY_terza_diagonale = altezza_bordo-15;
			//in questo caso ingredienti e nodi non devo condividere l'ordinata
		    NodeData.push({"cx": startX_terza_diagonale+(i*xspacing), "cy": startY_terza_diagonale-(i*yspacing), "radius": diametro_nodi, "color" : "blue", "id":third_ingredients_list[i]});
		}
		for (var i = 0; i < fourth_ingredients_list.length; i++) {
			let startX_quarta_diagonale = (larghezza_bordo*2)/3
			let startY_quarta_diagonale = starty-(yspacing/2);
			//in questo caso ingredienti e nodi non devo condividere l'ordinata
		    NodeData.push({"cx": startX_quarta_diagonale+(i*xspacing), "cy": startY_quarta_diagonale-(i*yspacing), "radius": diametro_nodi, "color" : "blue", "id":fourth_ingredients_list[i]});
		}
		

		// define tooltip
		// create a tooltip
	    var new_tooltip = d3.select("#chart2")
	      .append("div")
	      .attr("class", "tooltip")

	    new_tooltip.append('div')                           
		.attr('class', 'descr');   
	            
		var circles = 
		svgSelection.selectAll(".circle")
		.data(NodeData)
		.enter()
		.append("circle")
		.attr("class","circle")
		.on('mouseover', function(d){                          
			new_tooltip.select('.descr').html(d.id.bold());        
			new_tooltip.style('display', 'block');                    
		})
		.on('mouseout', function() {                     
		new_tooltip.style('display', 'none'); 
		})
		.on('mousemove', function(d) { 
		new_tooltip.style('top', (d3.event.layerY + 10) + 'px') 
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
	       .attr("d", d)
	       .attr("stroke","none");
		})

	   	var circleAttributes = circles
								.attr("id", function (d) { return d.id; })
	 							.attr("cx", function (d) { return d.cx; })
	 							.attr("cy", function (d) { return d.cy; })
	 							.attr("r", function (d) { return d.radius; })
	 							.style("fill", function (d) { return d.color; })


		//disegno archi
		var sorgente=[];
		var destinazione=[];
		var circles=document.getElementsByTagName("circle");
		for (var j = 0; j < Edge_Graph.length; j++) {
			for (var i = 0; i < (circles.length); i++) {
				if (circles[i].getAttribute("id")==Edge_Graph[j].sorgente){
					sorgente.push({"id":circles[i].getAttribute("id"),"cx":parseInt(circles[i].getAttribute("cx"),10),"cy":parseInt(circles[i].getAttribute("cy"),10)});
				}
				if (circles[i].getAttribute("id")==Edge_Graph[j].destinazione){
					destinazione.push({"id":circles[i].getAttribute("id"),"cx":parseInt(circles[i].getAttribute("cx"),10),"cy":parseInt(circles[i].getAttribute("cy"),10)});
				}
			}
		}	

		var SegmentData = [];
		
		var PuntiRaccordo = new Array();
		
		var PolygonData = [];

		for (var i = 0; i < sorgente.length; i++) {
			//se nodo sorgente è minore del nodo destinazione
			if ((sorgente[i].cx < destinazione[i].cx) && (sorgente[i].cy < destinazione[i].cy)){

				SegmentData.push({"x1":parseInt(sorgente[i].cx,10),"y1":parseInt(sorgente[i].cy,10)+diametro_nodi,"x2":(sorgente[i].cx),"y2":parseInt(destinazione[i].cy,10)-diametro_nodi});
				SegmentData.push({"x1":parseInt(sorgente[i].cx,10)+diametro_nodi,"y1":destinazione[i].cy,"x2":parseInt(destinazione[i].cx,10)-diametro_nodi,"y2":destinazione[i].cy});
				PuntiRaccordo.push({"x":parseInt(sorgente[i].cx,10),"y":parseInt(destinazione[i].cy,10)-diametro_nodi});
				PuntiRaccordo.push({"x":parseInt(sorgente[i].cx,10),"y":parseInt(destinazione[i].cy,10)});
				PuntiRaccordo.push({"x":parseInt(sorgente[i].cx,10)+diametro_nodi,"y":parseInt(destinazione[i].cy,10)});
				
				//attributi frecce
				var puntiFreccia = ((parseInt(destinazione[i].cx)-diametro_nodi-x_freccia).toString())+","+((parseInt(destinazione[i].cy)-y_freccia).toString())+" "+
								   ((parseInt(destinazione[i].cx)-diametro_nodi-x_freccia).toString())+","+((parseInt(destinazione[i].cy)+y_freccia).toString())+" "+
								   ((parseInt(destinazione[i].cx)-diametro_nodi).toString())+","+((parseInt(destinazione[i].cy)).toString())+" ";
				PolygonData.push({ "fill":  "black", "stroke": "black" ,"stroke-width":dimensione_freccia, "points": puntiFreccia})
				
				//curve di raccordo
				var lineFunction = d3.line()
			 							.x(function(d) { return d.x; })
										.y(function(d) { return d.y; })
										.curve(d3.curveBasis);
				//The line SVG Path we draw
				var lineGraph = svgSelection.append("path")
			                        .attr("d", lineFunction(PuntiRaccordo))
			                        .attr("stroke", "black")
			                        .attr("stroke-width", spessore_linea_raccordo)
			                        .attr("fill", "none");
				//svuoto array dei punti per la creazione delle curve di controllo
				PuntiRaccordo.pop();
				PuntiRaccordo.pop();
				PuntiRaccordo.pop();
				//console.log("caso1")
			}
			
			//se nodo sorgente è maggiore del nodo destinazione
			if ((sorgente[i].cx > destinazione[i].cx) && (sorgente[i].cy > destinazione[i].cy)){
				SegmentData.push({"x1":parseInt(sorgente[i].cx,10),"y1":parseInt(sorgente[i].cy,10)-diametro_nodi,"x2":(sorgente[i].cx),"y2":parseInt(destinazione[i].cy,10)+diametro_nodi});
				SegmentData.push({"x1":parseInt(sorgente[i].cx,10)-diametro_nodi,"y1":destinazione[i].cy,"x2":parseInt(destinazione[i].cx,10)+diametro_nodi,"y2":destinazione[i].cy});
				PuntiRaccordo.push({"x":parseInt(sorgente[i].cx,10),"y":parseInt(destinazione[i].cy,10)+diametro_nodi});
				PuntiRaccordo.push({"x":parseInt(sorgente[i].cx,10),"y":parseInt(destinazione[i].cy,10)});
				PuntiRaccordo.push({"x":parseInt(sorgente[i].cx,10)-diametro_nodi,"y":parseInt(destinazione[i].cy,10)});
				
				//attributi frecce
				var puntiFreccia = ((parseInt(destinazione[i].cx)+diametro_nodi+x_freccia).toString())+","+((parseInt(destinazione[i].cy)-y_freccia).toString())+" "+
								   ((parseInt(destinazione[i].cx)+diametro_nodi+x_freccia).toString())+","+((parseInt(destinazione[i].cy)+y_freccia).toString())+" "+
								   ((parseInt(destinazione[i].cx)+diametro_nodi).toString())+","+((parseInt(destinazione[i].cy)).toString())+" ";
				PolygonData.push({ "fill":  "black", "stroke": "black" ,"stroke-width":dimensione_freccia, "points": puntiFreccia})
				
				//curve di raccordo
				var lineFunction = d3.line()
			 							.x(function(d) { return d.x; })
										.y(function(d) { return d.y; })
										.curve(d3.curveBasis);
				//The line SVG Path we draw
				var lineGraph = svgSelection.append("path")
			                        .attr("d", lineFunction(PuntiRaccordo))
			                        .attr("stroke", "black")
			                        .attr("stroke-width", spessore_linea_raccordo)
			                        .attr("fill", "none");
				//svuoto array dei punti per la creazione delle curve di controllo
				PuntiRaccordo.pop();
				PuntiRaccordo.pop();
				PuntiRaccordo.pop();
				//console.log("caso2")
			}
			if((sorgente[i].cx>destinazione[i].cx)&& (sorgente[i].cy<destinazione[i].cy)){
				SegmentData.push({"x1":parseInt(sorgente[i].cx,10),"y1":parseInt(sorgente[i].cy,10)+diametro_nodi,"x2":(sorgente[i].cx),"y2":parseInt(destinazione[i].cy,10)-diametro_nodi});
				SegmentData.push({"x1":parseInt(sorgente[i].cx,10)-diametro_nodi,"y1":destinazione[i].cy,"x2":parseInt(destinazione[i].cx,10)+diametro_nodi,"y2":destinazione[i].cy});
				PuntiRaccordo.push({"x":parseInt(sorgente[i].cx,10),"y":parseInt(destinazione[i].cy,10)-diametro_nodi});
				PuntiRaccordo.push({"x":parseInt(sorgente[i].cx,10),"y":parseInt(destinazione[i].cy,10)});
				PuntiRaccordo.push({"x":parseInt(sorgente[i].cx,10)-diametro_nodi,"y":parseInt(destinazione[i].cy,10)});

				var puntiFreccia = ((parseInt(destinazione[i].cx)+diametro_nodi+x_freccia).toString())+","+((parseInt(destinazione[i].cy)-y_freccia).toString())+" "+
								   ((parseInt(destinazione[i].cx)+diametro_nodi+x_freccia).toString())+","+((parseInt(destinazione[i].cy)+y_freccia).toString())+" "+
								   ((parseInt(destinazione[i].cx)+diametro_nodi).toString())+","+((parseInt(destinazione[i].cy)).toString())+" ";
				PolygonData.push({ "fill":  "black", "stroke": "black" ,"stroke-width":dimensione_freccia, "points": puntiFreccia})
				
				//curve di raccordo
				var lineFunction = d3.line()
			 							.x(function(d) { return d.x; })
										.y(function(d) { return d.y; })
										.curve(d3.curveBasis);
				//The line SVG Path we draw
				var lineGraph = svgSelection.append("path")
			                        .attr("d", lineFunction(PuntiRaccordo))
			                        .attr("stroke", "black")
			                        .attr("stroke-width", spessore_linea_raccordo)
			                        .attr("fill", "none");
				//svuoto array dei punti per la creazione delle curve di controllo
				PuntiRaccordo.pop();
				PuntiRaccordo.pop();
				PuntiRaccordo.pop();
				//console.log("caso3")
			}
			if((sorgente[i].cx<destinazione[i].cx)&& (sorgente[i].cy>destinazione[i].cy)){
				SegmentData.push({"x1":parseInt(sorgente[i].cx,10),"y1":parseInt(sorgente[i].cy,10)-diametro_nodi,"x2":(sorgente[i].cx),"y2":parseInt(destinazione[i].cy,10)+diametro_nodi});
				SegmentData.push({"x1":parseInt(sorgente[i].cx,10)+diametro_nodi,"y1":destinazione[i].cy,"x2":parseInt(destinazione[i].cx,10)-diametro_nodi,"y2":destinazione[i].cy});
				PuntiRaccordo.push({"x":parseInt(sorgente[i].cx,10),"y":parseInt(destinazione[i].cy,10)+diametro_nodi});
				PuntiRaccordo.push({"x":parseInt(sorgente[i].cx,10),"y":parseInt(destinazione[i].cy,10)});
				PuntiRaccordo.push({"x":parseInt(sorgente[i].cx,10)+diametro_nodi,"y":parseInt(destinazione[i].cy,10)});

				var puntiFreccia = ((parseInt(destinazione[i].cx)-diametro_nodi-x_freccia).toString())+","+((parseInt(destinazione[i].cy)-y_freccia).toString())+" "+
								   ((parseInt(destinazione[i].cx)-diametro_nodi-x_freccia).toString())+","+((parseInt(destinazione[i].cy)+y_freccia).toString())+" "+
								   ((parseInt(destinazione[i].cx)-diametro_nodi).toString())+","+((parseInt(destinazione[i].cy)).toString())+" ";
				PolygonData.push({ "fill":  "black", "stroke": "black" ,"stroke-width":dimensione_freccia, "points": puntiFreccia})
				
				//curve di raccordo
				var lineFunction = d3.line()
			 							.x(function(d) { return d.x; })
										.y(function(d) { return d.y; })
										.curve(d3.curveBasis);
				//The line SVG Path we draw
				var lineGraph = svgSelection.append("path")
			                        .attr("d", lineFunction(PuntiRaccordo))
			                        .attr("stroke", "black")
			                        .attr("stroke-width", spessore_linea_raccordo)
			                        .attr("fill", "none");
				//svuoto array dei punti per la creazione delle curve di controllo
				PuntiRaccordo.pop();
				PuntiRaccordo.pop();
				PuntiRaccordo.pop();
				//console.log("caso4")
			}
		}

		//segmenti
		var lines = svgSelection.selectAll("line")
	    						.data(SegmentData)
	    						.enter()
	    						.append("line");
		var lineAttributes = lines
	    						.attr("x1", function (d) { return d.x1; })
	    						.attr("y1", function (d) { return d.y1; })
	    						.attr("x2", function (d) { return d.x2; })
	    						.attr("y2", function (d) { return d.y2; })
	    						.attr("stroke-width", 0.5)
								.attr("stroke", "black")
								.attr("fill", "none");

		
		var Polygons = svgSelection.selectAll("polygon")
									.data(PolygonData)
									.enter()
									.append("polygon");
		var PolygonAttributes = Polygons
									.attr("points", function (d) { return d.points; })
									.style("fill", function (d) { return d.fill; })

		//add legend
		svgSelection.append("circle").attr("cx",30).attr("cy",30).attr("r", 10).style("fill", "red")
		svgSelection.append("circle").attr("cx",30).attr("cy",60).attr("r", 10).style("fill", "blue")
		svgSelection.append("text").attr("x", 50).attr("y", 30).attr("font-weight",600).text("Piatti ("+selected_meals.length+")").style("font-size", "15px").attr("alignment-baseline","middle")
		svgSelection.append("text").attr("x", 50).attr("y", 60)	.attr("font-weight",600).text("Ingredienti ("+ingredients.length+")").style("font-size", "15px").attr("alignment-baseline","middle")
		
	});
