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

		function getIngredients(nome_piatto){
			var ingredienti;
			dataset.forEach(function(value, index) {
				Object.keys(value).forEach(function(v, i) {
					piatto = value[v];
					//console.log(piatto);
					if(piatto.name == nome_piatto ){
						//console.log(piatto.ingredients);
						ingredienti = piatto.ingredients;
					}
				})
			})
			return ingredienti;
		}
		function updateColorIngredient(ingredient,color){
			for(var i=0; i<NodeData.length;i++){
				var tmp = NodeData[i];
				if(tmp.id==ingredient){
					tmp.color = color;
				}	
			}
		}

		function updateLine(piatto,color,width){
			for(var i=0; i<SegmentData.length;i++){
				var tmp = SegmentData[i];
				if(tmp.id==piatto){
					tmp.line_color = color;
					tmp.stroke_width=width;
				}	
			}
		}

		function updateFreccia(piatto,color){
			for(var i=0; i<PolygonData.length;i++){
				var tmp = PolygonData[i];
				if(tmp.id==piatto){
					tmp.fill = color;
				}	
			}
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
		var fill_punti_raccordo = "none";
		var bundle = 0;
		if(ingredients.length >= 25 && ingredients.length <39){
			diametro_nodi=6;
			x_freccia = 5;
			y_freccia = 3;
		} 
		if(ingredients.length >= 39 && ingredients.length <= 45 ){
			diametro_nodi=5;
			x_freccia = 4;
			y_freccia = 3;
		} 
		if(ingredients.length == 65 ){
			diametro_nodi=5;
			x_freccia = 3;
			y_freccia = 1;
		} 
		
		var larghezza_bordo = 990;
		var altezza_bordo = 504;
		var bodySelection = d3.select ("#chart2");

		var svgSelection = bodySelection.append("svg")
			.attr("width", larghezza_bordo)
	 		.attr("height", altezza_bordo)
			.style("border", "1px solid black")

		
		
			//disegno nodi in ordine dell'array areas
		var NodeData =[];
		
		var len_selected_meals = selected_meals.length;
		var len_selected_ingredients = ingredients.length;
		xspacing = (larghezza_bordo/3)/len_selected_meals;
		yspacing = (altezza_bordo/2)/(len_selected_ingredients/3);

		for (var i = 0; i < selected_meals.length; i++) {
			//mettiamo lo start x in mezzo a due nodi della diagonale
			var startx = (larghezza_bordo/3)+10;
			var starty = altezza_bordo/2;
			NodeData.push({"cx": startx+(i*xspacing), "cy": starty, "radius": diametro_nodi, "color" : "red", "id":selected_meals[i]});
		}
		
		var indexToSplit = Math.round(ingredients.length/4);
		var first_ingredients_list = ingredients.slice(0, indexToSplit);
		var second_ingredients_list = ingredients.slice(indexToSplit,indexToSplit*2);
		var third_ingredients_list = ingredients.slice(indexToSplit*2,indexToSplit*3);
		var fourth_ingredients_list = ingredients.slice(indexToSplit*3);

		//disegno nodi in ordine dell'array ingredients
		for (var i = 0; i < first_ingredients_list.length; i++) {
			let startX_prima_diagonale = (larghezza_bordo/3)-50
			let startY_prima_diagonale = altezza_bordo/2-15;
			//in questo caso ingredienti e nodi non devo condividere l'ordinata
		    NodeData.push({"cx": Math.round(startX_prima_diagonale), "cy": Math.round(startY_prima_diagonale-(i*yspacing)), "radius": diametro_nodi, "color" : "blue", "id":first_ingredients_list[i]});
		    svgSelection.append("text").attr("x", startX_prima_diagonale-150).attr("y",Math.round(startY_prima_diagonale-(i*yspacing)))
		    .attr("font-weight",400).text(first_ingredients_list[i]).style("font-size", "10px").attr("alignment-baseline","middle")
		}
		for (var i=0; i<second_ingredients_list.length;i++){
			let startX_seconda_diagonale = (larghezza_bordo/3)-50;
			let startY_seconda_diagonale = (altezza_bordo/2)+15;
			//in questo caso devo far sì che ingredienti e nodi non condividano la ascissa
			NodeData.push({"cx": Math.round(startX_seconda_diagonale), "cy": Math.round(startY_seconda_diagonale+(i*yspacing)), "radius": diametro_nodi, "color" : "blue", "id":second_ingredients_list[i]});
			svgSelection.append("text").attr("x", startX_seconda_diagonale-150).attr("y",Math.round(startY_seconda_diagonale+(i*yspacing)))
		    .attr("font-weight",400).text(second_ingredients_list[i]).style("font-size", "10px").attr("alignment-baseline","middle")
		}
		for (var i = 0; i < third_ingredients_list.length; i++) {
			let startX_terza_diagonale = (larghezza_bordo*2/3)+50;
			let startY_terza_diagonale = (altezza_bordo/2)-15-(yspacing/2);
			//in questo caso ingredienti e nodi non devo condividere l'ordinata
		    NodeData.push({"cx": Math.round(startX_terza_diagonale), "cy": Math.round(startY_terza_diagonale-(i*yspacing)), "radius": diametro_nodi, "color" : "blue", "id":third_ingredients_list[i]});
		    svgSelection.append("text").attr("x", startX_terza_diagonale+10).attr("y",Math.round(startY_terza_diagonale-(i*yspacing)))
		    .attr("font-weight",400).text(third_ingredients_list[i]).style("font-size", "10px").attr("alignment-baseline","middle")
		}
		for (var i = 0; i < fourth_ingredients_list.length; i++) {
			let startX_quarta_diagonale = (larghezza_bordo*2/3)+50;
			let startY_quarta_diagonale = (altezza_bordo/2)+15+(yspacing/2);
			//in questo caso ingredienti e nodi non devo condividere l'ordinata
		    NodeData.push({"cx": Math.round(startX_quarta_diagonale), "cy": Math.round(startY_quarta_diagonale+(i*yspacing)), "radius": diametro_nodi, "color" : "blue", "id":fourth_ingredients_list[i]});
		    svgSelection.append("text").attr("x", startX_quarta_diagonale+10).attr("y",Math.round(startY_quarta_diagonale+(i*yspacing)))
		    .attr("font-weight",400).text(fourth_ingredients_list[i]).style("font-size", "10px").attr("alignment-baseline","middle")
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
			if(d.color =="red"){
				new_tooltip.select('.descr').html(d.id.bold());        
				new_tooltip.style('display', 'block') 
				var tmp = getIngredients(d.id);
				for(var i=0; i<tmp.length; i++){
						updateColorIngredient(tmp[i],"orange");
						svgSelection.selectAll(".circle")
						.style("fill",function (d) { return d.color; });
						updateLine(d.id,"orange",1.5);
						svgSelection.selectAll("line")
	    				.attr("stroke", function (d) { return d.line_color; })
	    				.attr("stroke-width", function (d) { return d.stroke_width; })
	    				updateFreccia(d.id,"orange");
						svgSelection.selectAll("polygon")
	    				.style("fill", function (d) { return d.fill; })
	    				//svgSelection.selectAll("#"+d.id).raise();
				}
			}
		})
		.on('mouseout', function(d) {                     
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
			if(d.color =="red"){
				var tmp = getIngredients(d.id);
				for(var i=0; i<tmp.length; i++){
						updateColorIngredient(tmp[i],"blue");
						svgSelection.selectAll(".circle")
						.style("fill",function (d) { return d.color; });
						updateLine(d.id,"black",0.5);
						svgSelection.selectAll("line")
	    				.attr("stroke", function (d) { return d.line_color; })
	    				.attr("stroke-width", function (d) { return d.stroke_width; })
	    				updateFreccia(d.id,"black");
						svgSelection.selectAll("polygon")
	    				.style("fill", function (d) { return d.fill; })

				}
		}
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
				SegmentData.push({"x1":parseInt(sorgente[i].cx,10),"y1":parseInt(sorgente[i].cy,10)+diametro_nodi,"x2":(sorgente[i].cx),"y2":parseInt(destinazione[i].cy,10)-diametro_nodi,"id":sorgente[i].id, "line_color": "black", "stroke_width":0.5});
				SegmentData.push({"x1":parseInt(sorgente[i].cx,10)+diametro_nodi,"y1":destinazione[i].cy,"x2":parseInt(destinazione[i].cx,10)-diametro_nodi,"y2":destinazione[i].cy,"id":sorgente[i].id, "line_color": "black", "stroke_width":0.5});
				SegmentData.push({"x1":parseInt(sorgente[i].cx,10),"y1":parseInt(destinazione[i].cy,10)-diametro_nodi,
				"x2":parseInt(sorgente[i].cx,10)+diametro_nodi,"y2":parseInt(destinazione[i].cy,10),"id":sorgente[i].id, "line_color": "black", "stroke_width":0.5});
				
				//attributi frecce
				var puntiFreccia = ((parseInt(destinazione[i].cx)-diametro_nodi-x_freccia).toString())+","+((parseInt(destinazione[i].cy)-y_freccia).toString())+" "+
								   ((parseInt(destinazione[i].cx)-diametro_nodi-x_freccia).toString())+","+((parseInt(destinazione[i].cy)+y_freccia).toString())+" "+
								   ((parseInt(destinazione[i].cx)-diametro_nodi).toString())+","+((parseInt(destinazione[i].cy)).toString())+" ";
				PolygonData.push({ "fill":  "black", "stroke": "black" ,"stroke-width":dimensione_freccia, "points": puntiFreccia, "id":sorgente[i].id})
				
			}
			
			//se nodo sorgente è maggiore del nodo destinazione
			if ((sorgente[i].cx > destinazione[i].cx) && (sorgente[i].cy > destinazione[i].cy)){
				SegmentData.push({"x1":parseInt(sorgente[i].cx,10),"y1":parseInt(sorgente[i].cy,10)-diametro_nodi,"x2":(sorgente[i].cx),"y2":parseInt(destinazione[i].cy,10)+diametro_nodi,"id":sorgente[i].id, "line_color": "black", "stroke_width":0.5});
				SegmentData.push({"x1":parseInt(sorgente[i].cx,10)-diametro_nodi,"y1":destinazione[i].cy,"x2":parseInt(destinazione[i].cx,10)+diametro_nodi,"y2":destinazione[i].cy,"id":sorgente[i].id, "line_color": "black", "stroke_width":0.5});
				SegmentData.push({"x1":parseInt(sorgente[i].cx,10),"y1":parseInt(destinazione[i].cy,10)+diametro_nodi, 
				"x2":parseInt(sorgente[i].cx,10)-diametro_nodi,"y2":parseInt(destinazione[i].cy,10), "id":sorgente[i].id, "line_color": "black", "stroke_width":0.5});
				
				//attributi frecce
				var puntiFreccia = ((parseInt(destinazione[i].cx)+diametro_nodi+x_freccia).toString())+","+((parseInt(destinazione[i].cy)-y_freccia).toString())+" "+
								   ((parseInt(destinazione[i].cx)+diametro_nodi+x_freccia).toString())+","+((parseInt(destinazione[i].cy)+y_freccia).toString())+" "+
								   ((parseInt(destinazione[i].cx)+diametro_nodi).toString())+","+((parseInt(destinazione[i].cy)).toString())+" ";
				PolygonData.push({ "fill":  "black", "stroke": "black" ,"stroke-width":dimensione_freccia, "points": puntiFreccia, "id":sorgente[i].id})
				
				
			}
			if((sorgente[i].cx>destinazione[i].cx)&& (sorgente[i].cy<destinazione[i].cy)){
				SegmentData.push({"x1":parseInt(sorgente[i].cx,10),"y1":parseInt(sorgente[i].cy,10)+diametro_nodi,"x2":(sorgente[i].cx),"y2":parseInt(destinazione[i].cy,10)-diametro_nodi,"id":sorgente[i].id, "line_color": "black", "stroke_width":0.5});
				SegmentData.push({"x1":parseInt(sorgente[i].cx,10)-diametro_nodi,"y1":destinazione[i].cy,"x2":parseInt(destinazione[i].cx,10)+diametro_nodi,"y2":destinazione[i].cy,"id":sorgente[i].id, "line_color": "black", "stroke_width":0.5});
				SegmentData.push({"x1":parseInt(sorgente[i].cx,10),"y1":parseInt(destinazione[i].cy,10)-diametro_nodi,
				"x2":parseInt(sorgente[i].cx,10)-diametro_nodi,"y2":parseInt(destinazione[i].cy,10), "id":sorgente[i].id, "line_color": "black", "stroke_width":0.5});

				var puntiFreccia = ((parseInt(destinazione[i].cx)+diametro_nodi+x_freccia).toString())+","+((parseInt(destinazione[i].cy)-y_freccia).toString())+" "+
								   ((parseInt(destinazione[i].cx)+diametro_nodi+x_freccia).toString())+","+((parseInt(destinazione[i].cy)+y_freccia).toString())+" "+
								   ((parseInt(destinazione[i].cx)+diametro_nodi).toString())+","+((parseInt(destinazione[i].cy)).toString())+" ";
				PolygonData.push({ "fill":  "black", "stroke": "black" ,"stroke-width":dimensione_freccia, "points": puntiFreccia, "id":sorgente[i].id})
				
			}
			if((sorgente[i].cx<destinazione[i].cx)&& (sorgente[i].cy>destinazione[i].cy)){
				SegmentData.push({"x1":parseInt(sorgente[i].cx,10),"y1":parseInt(sorgente[i].cy,10)-diametro_nodi,"x2":(sorgente[i].cx),"y2":parseInt(destinazione[i].cy,10)+diametro_nodi,"id":sorgente[i].id, "line_color": "black", "stroke_width":0.5});
				SegmentData.push({"x1":parseInt(sorgente[i].cx,10)+diametro_nodi,"y1":destinazione[i].cy,"x2":parseInt(destinazione[i].cx,10)-diametro_nodi,"y2":destinazione[i].cy,"id":sorgente[i].id, "line_color": "black", "stroke_width":0.5});
				SegmentData.push({"x1":parseInt(sorgente[i].cx,10),"y1":parseInt(destinazione[i].cy,10)+diametro_nodi,
				"x2":parseInt(sorgente[i].cx,10)+diametro_nodi,"y2":parseInt(destinazione[i].cy,10),"id":sorgente[i].id, "line_color": "black", "stroke_width":0.5});

				var puntiFreccia = ((parseInt(destinazione[i].cx)-diametro_nodi-x_freccia).toString())+","+((parseInt(destinazione[i].cy)-y_freccia).toString())+" "+
								   ((parseInt(destinazione[i].cx)-diametro_nodi-x_freccia).toString())+","+((parseInt(destinazione[i].cy)+y_freccia).toString())+" "+
								   ((parseInt(destinazione[i].cx)-diametro_nodi).toString())+","+((parseInt(destinazione[i].cy)).toString())+" ";
				PolygonData.push({ "fill":  "black", "stroke": "black" ,"stroke-width":dimensione_freccia, "points": puntiFreccia, "id":sorgente[i].id})
				
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
	    						.attr("id", function (d) { return d.id; })
	    						.attr("stroke-width", function (d) { return d.stroke_width; })
								.attr("stroke", function (d) { return d.line_color; })
								.attr("fill", "none");

		
		var Polygons = svgSelection.selectAll("polygon")
									.data(PolygonData)
									.enter()
									.append("polygon");
		var PolygonAttributes = Polygons
									.attr("points", function (d) { return d.points; })
									.attr("id", function (d) { return d.id; })
									.style("fill", function (d) { return d.fill; })

		//add legend
		/*
		svgSelection.append("circle").attr("cx",30).attr("cy",30).attr("r", 10).style("fill", "red")
		svgSelection.append("circle").attr("cx",30).attr("cy",60).attr("r", 10).style("fill", "blue")
		svgSelection.append("text").attr("x", 50).attr("y", 30).attr("font-weight",600).text("Piatti ("+selected_meals.length+")").style("font-size", "15px").attr("alignment-baseline","middle")
		svgSelection.append("text").attr("x", 50).attr("y", 60)	.attr("font-weight",600).text("Ingredienti ("+ingredients.length+")").style("font-size", "15px").attr("alignment-baseline","middle")
		*/
		d3.selectAll("circle").raise();

	})

	;
