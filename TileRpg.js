function TileRpgFramework(){
	this.frameworkName = "TileRpgFramework";
	var Trpg = this;
	this.WorldLoc = function(wx, wy, cx, cy, dim, mx, my){
		this.wx = wx || 0;
		this.wy = wy || 0;
		this.cx = cx || 0;
		this.cy = cy || 0;
		this.dim = dim || "surface";
		this.mx = mx || 16;
		this.my = my || 16;
		var dims = [//flipped
		"underground2",
		"underground1",
		"surface",
		"floor1",
		"floor2",
		];
		this.x = function(){
			return 8*this.wx+this.cx;
		}
		this.y = function(){
			return 8*this.wy+this.cy;
		}
		this.dx = function(other){
			return 8*(other.wx-this.wx)+other.cx-this.cx;//+(other.mx-this.mx)/32;
		}
		this.dy = function(other){
			return 8*(other.wy-this.wy)+other.cy-this.cy;//+(other.my-this.my)/32;
		}
		this.mdx = function(o){
			return this.dx(o)+(o.mx-this.mx)/32;
		}
		this.mdy = function(o){
			return this.dy(o)+(o.my-this.my)/32;
		}
		this.getadjs = function(){
			return [(this.copy().shift(0,-1)),
					(this.copy().shift(1,0)),
					(this.copy().shift(0,1)),
					(this.copy().shift(-1,0))]
		}
		this.onmove = function(wl){return true}
		this.move = function(mx,my){
			this.mx+=mx;
			this.my+=my;
			if (this.mx < 0 || this.mx >= 32){
				if (this.onmove(this.copy().shift(Math.sign(mx),0))){
					this.shift(Math.sign(mx),0);
					this.mx-=32*Math.sign(mx);
				} else this.mx-=mx;
			}
			if (this.my < 0 || this.my >= 32){
				if (this.onmove(this.copy().shift(0,Math.sign(my)))){
					this.shift(0,Math.sign(my));
					this.my-=32*Math.sign(my);
				} else this.my-=my;
			}
		}
		this.shift = function(dx,dy,dim){
			this.cx+=dx||0;
			this.cy+=dy||0;
			if (typeof dim == "number" 
				&& dims.indexOf(this.dim)+dim>=0
				&& dims.indexOf(this.dim)+dim<dims.length)
				this.dim = dims[dims.indexOf(this.dim)+dim];
			else if (dims.indexOf(dim)!==-1)
				this.dim = dim;
			return this.legalize();
		}
		this.tochunk = function(){
			this.cx = this.cy = 0;
			return this;
		}
		this.chunkdist = function(other){
			return Math.max(Math.abs(other.wx-this.wx),Math.abs(other.wy-this.wy));
		}
		this.mdist = function(other){
			return Math.max(Math.abs(this.mdx(other)),Math.abs(this.mdy(other)));
		}
		this.dist = function(other, min){
			//if (other.dim !== this.dim)	return -1;
			//return Math.round(Math.sqrt(Math.pow(8*(this.wx-other.wx)+this.cx-other.cx,2)+Math.pow(8*(this.wy-other.wy)+this.cy-other.cy,2)));
			if (!min)	return Math.max(Math.abs(this.dx(other)),Math.abs(this.dy(other)));
			else		return Math.min(Math.abs(8*(this.wx-other.wx)+this.cx-other.cx),Math.abs(8*(this.wy-other.wy)+this.cy-other.cy));
		}
		this.legalize = function(){
			while(this.cx < 0 || this.cx > 7){
				this.wx+=Math.sign(this.cx);
				this.cx-=8*Math.sign(this.cx);
			}
			while(this.cy < 0 || this.cy > 7){
				this.wy+=Math.sign(this.cy);
				this.cy-=8*Math.sign(this.cy);
			}
			return this;
		}
		this.load = function(wl){
			this.wx = wl.wx;
			this.wy = wl.wy;
			this.cx = wl.cx;
			this.cy = wl.cy;
			this.dim = wl.dim;
			return this;
		}
		this.copy = function(){
			return new Trpg.WorldLoc(this.wx,this.wy,this.cx,this.cy,this.dim,this.mx,this.my);
		}
		this.toStr = function(){
			return "("+this.wx+", "+this.wy+", "+this.cx+", "+this.cy+", "+this.dim+")";
		}
	}
	this.Populate = function(H){
		Trpg.Home = H
		H.empty();
		H.bcolor = "black";
		H.color = "grey";
		H.w = 1200;
		H.h = 800;
		H.container.stretchfit(H);
		//H.camera.reset();
		
		function Title(){
			var t = new UI.DBox();
			//t.color = "grey";
			t.cropper = false;
			t.add(new (function(){
				this.render = function(g){
					g.font = "100px Arial";
					g.fillStyle = "white";
					Drw.drawCText(g, "TileRPG", 600,200);
				}
			})());
			t.add(new UI.Button(500,300,200,50).sets({color:"green",text:"New Game",key:"n",onclick:function(){StartGame(true);}}));
			t.add(new UI.Button(500,400,200,50).sets({color:"blue",text:"Load Game",key:"l",onclick:function(){StartGame(false);}}));
			/*t.add(new UI.Button(500,500,200,50).sets({color:"red",text:"Instructions",onclick:function(){
				function instr(){
					var box = new UI.DBox(0,0,1200,800);
					box.color = "grey";
					box.add({render:function(g){
						g.font = "30px Arial";
						g.fillStyle = "white";
						Drw.drawBoxText(g,"Right click on a tile to open list of available actions.\n \n "+
						"Left clicking on a tile will default\n to the first action.\n \n "+
						"Clicking on an action in progress will cancel Trpg action.\n \n "+
						"Use W A S D to move.\n \n "+
						"Trees can be cut for logs. Logs can be burned with a tinderbox.\n \n "+
						"Dig up stumps to plant a new tree. Walking on seedling will kill it.\n \n "+
						"",600,150,600);
					}});
					box.add(new UI.Button(500,600,200,50).sets({color:"yellow",text:"Back",onclick:function(){t.remove(box);}}))
					return box;
				}
				t.add(new instr());
			}}));*/
			return t;
		}
		H.newtab("TitleMenu", Title());
		/*makeShortcut(H.get("Gameplay"),"Gameplay",true);
		var instrs = new UI.DBox();
		instrs.add(new (function(){
			this.render = function(g){
				g.font = "35px Arial";
				g.fillStyle = "white";
				Drw.drawBoxText(g,"Right click on a tile to open list of available actions.\n \n "+
				"Left clicking on a tile will default\n to the first action.\n \n "+
				"Clicking on an action in progress will cancel Trpg action.\n \n "+
				"Use W A S D to move.\n \n "+
				"",600,150,600);
			}
		})());
		instrs.add(new UI.Button(550,450,100,50).sets({text:"Back",color:"yellow",onclick:function(){U.prevtab()}}));
		//instrs.add(new Utils.KeyListener("down","Escape",function(){console.log("F$RG%H");}));
		H.newtab("Instructions",instrs);
		*/
		function Gameplay(){
			var g = new UI.DBox();
			var b,h,i,s,m,M,I;
			g.add(b = new UI.DBox(0,0,800,800),"Board");
			//g.add(h = new UI.DBox(800,0,400,800),"Hud");
			g.add(m = new UI.DBox(800,0,400,350),"Minimap");
			g.add(I = new UI.DBox(800,350,400,450),"InvTabs");
			I.newtab("Invent",i = new UI.DBox(0,0,322,450));
			I.newtab("Skills",s = new UI.DBox(0,0,322,450));
			I.add(new UI.Button(326,6,64,64*3.5).sets({inrender:function(g){
				g.font = "35px Arial";
				g.fillStyle = "black";
				Drw.drawBoxText(g, "I N V E N T", 32, 32, 32);
			},onclick:function(){I.settab("Invent")}}));
			I.add(new UI.Button(326,64*3.5+6,64,64*3.5).sets({inrender:function(g){
				g.font = "35px Arial";
				g.fillStyle = "black";
				Drw.drawBoxText(g, "S K I L L S", 32, 10, 16);
			},onclick:function(){I.settab("Skills")}}));
			I.settab("Invent");
			s.add({render:function(g){g.fillStyle = "black";g.font = "30px Arial";
				Drw.drawCText(g,"Coming soon",this.container.w/2,this.container.h/2)}});
			g.add(M = new UI.DBox(),"Menus");
			//M.camera.zoom(2);
			i.color = "rgb(96,96,96)";
			b.bcolor = b.color = /*h.color = h.bcolor = i.bcolor =*/ m.color = "black";
			m.add(Trpg.Map);
			
			return g;
			/*H.add(new Utils.KeyListener("down","Escape",function(){H.prevtab()}));
			Board.add(new Utils.KeyListener("down","p",function(){H.settab("Instructions");}));
			H.settab("TitleMenu");
		}
			H.add(new UI.Button(500,500,200,50).sets({color:"red",text:"Instructions",key:"i",onclick:function(){U.settab("Instructions")}}),"TitleMenu.");*/
	}
		//	H.add(new Utils.KeyListener("down","c",function(){Trpg.Entities.entities.push(new Trpg.Entities.Entity("Cow",Trpg.board.aim.copy()))}));
			H.add(new Utils.Listener(function(){
				return  K.Keys.n1.down && 
						K.Keys.n2.down &&
						K.Keys.n3.down &&
						K.Keys.n4.down &&
						K.Keys.n5.down
			}, function(){
				alert("cheat activated");
				H.add(new Utils.KeyListener("down","p",function(){	Trpg.invent.additem(new Trpg.Item("Seed"))			}));
				H.add(new Utils.KeyListener("down","1",function(){	Trpg.invent.additem(new Trpg.Item("TinOre"))		}));
				H.add(new Utils.KeyListener("down","2",function(){	Trpg.invent.additem(new Trpg.Item("CopperOre"))		}));
				H.add(new Utils.KeyListener("down","3",function(){	Trpg.invent.additem(new Trpg.Item("IronOre"))		}));
				H.add(new Utils.KeyListener("down","4",function(){	Trpg.invent.additem(new Trpg.Item("MithrilOre"))	}));
				H.add(new Utils.KeyListener("down","5",function(){	Trpg.invent.additem(new Trpg.Item("AdamantOre"))	}));
				H.add(new Utils.KeyListener("down","6",function(){	Trpg.invent.additem(new Trpg.Item("RuniteOre"))		}));
				H.add(new Utils.KeyListener("down","7",function(){	Trpg.invent.additem(new Trpg.Item("EterniumOre"))	}));
				H.add(new Utils.KeyListener("down","8",function(){	Trpg.invent.additem(new Trpg.Item("CoalOre"),4);	}));
				H.add(new Utils.KeyListener("down","9",function(){	Trpg.invent.additem(new Trpg.Item("Coins"),5000)		}));
				return true;
			}));
			/*H.add(new Utils.KeyListener("down","1",function(){	Trpg.invent.additem(new Trpg.Item("TinOre"))		}));
			H.add(new Utils.KeyListener("down","2",function(){	Trpg.invent.additem(new Trpg.Item("CopperOre"))		}));
			H.add(new Utils.KeyListener("down","3",function(){	Trpg.invent.additem(new Trpg.Item("IronOre"))		}));
			H.add(new Utils.KeyListener("down","4",function(){	Trpg.invent.additem(new Trpg.Item("MithrilOre"))	}));
			H.add(new Utils.KeyListener("down","5",function(){	Trpg.invent.additem(new Trpg.Item("AdamantOre"))	}));
			H.add(new Utils.KeyListener("down","6",function(){	Trpg.invent.additem(new Trpg.Item("RuniteOre"))		}));
			H.add(new Utils.KeyListener("down","7",function(){	Trpg.invent.additem(new Trpg.Item("EterniumOre"))	}));
			H.add(new Utils.KeyListener("down","o",function(){	Trpg.invent.additem(new Trpg.Item("Coin"),5000)	}));
			H.add(new Utils.KeyListener("down","p",function(){	Trpg.invent.additem(new Trpg.Item("Coin"),500000)	}));
			H.add(new Utils.KeyListener("down","9",function(){	Trpg.invent.additem(new Trpg.Item("Coin"),500000000)	}));
			H.add(new Utils.KeyListener("down","0",function(){	Trpg.invent.additem(new Trpg.Item("Coin"),500000000000)	}));
			H.add(new Utils.KeyListener("down","8",function(){	//for (var i = 0; i < 50000; i++)
			*/							//						Trpg.invent.additem(new Trpg.Item("CoalOre"));		}));
			/*H.add(new Utils.KeyListener("down","o",function(){
				Trpg.invent.additem(new Trpg.Item("Tin"));
				Trpg.invent.additem(new Trpg.Item("Copper"));
			}));
			H.add(new Utils.KeyListener("down","b",function(){
				Trpg.invent.additem(new Trpg.Item("BronzeBar"));
			}));
			/*H.add(new Utils.KeyListener("down","u",function(){
				if (Trpg.board.cloc.dim=="surface")
					Trpg.board.cloc.dim = "underground1";
				else
					Trpg.board.cloc.dim = "surface";
				Trpg.board.load(Trpg.board.cloc,true);
			}));*/
		H.newtab("Gameplay",Gameplay());
		H.settab("TitleMenu")
		//Trpg.Board = H.get("Gameplay.Board");
		
		Trpg.SaveGame = function(){
			if (Trpg.world.getChanges()!="none")
				localStorage.setItem("TRPGSaveSlot"/*+this.slot*/,JSON.stringify(Trpg.world.getChanges()));
			return null;
		}
		function StartGame(newgame){
			new Trpg.World("zack is cool");
			H.add(Trpg.board,"Gameplay.Board.");
			H.add(Trpg.invent,"Gameplay.InvTabs.Invent.")
			if (newgame)
			//Invent.add(Trpg.invent);
				localStorage.removeItem("TRPGSaveSlot");//+this.slot);
			if (localStorage.getItem("TRPGSaveSlot"/*+this.slot*/)!=null)
				Trpg.world.loadChanges(JSON.parse(localStorage.getItem("TRPGSaveSlot"/*+this.slot*/)));
			
			window.onbeforeunload = Trpg.SaveGame;
			H.settab("Gameplay");
		}
	}
	/*this.ShittyBirdThing = function(){
		this.wl = Trpg.board.cloc.copy();
		this.wl.wx+=Math.floor(Math.random()*2-1);
		this.wl.wy+=Math.floor(Math.random()*2-1);
		this.mx = this.my = 16;
		this.kill = function(){
			Board.container.get("killcounter").count++;
			this.container.remove(this);
		}
		this.update = function(d){
			//return;
			var dx = this.wl.dx(Trpg.board.cloc);
			var dy = this.wl.dy(Trpg.board.cloc);
			//console.log(dx+" "+dy);
			if (dx==0&&dy==0){
				Board.container.get("healthbar").health--;
				this.container.remove(this);
				return;
			}
			dx*=32;
			dx+=Trpg.board.mx-this.mx;
			dy*=32;
			dy+=Trpg.board.my-this.my;
			var angle = Math.atan2(dy,dx);
			this.mx+=170*d*Math.cos(angle);
			this.my+=170*d*Math.sin(angle);
			if (this.mx < 0 || this.mx >= 32){
				this.wl.cx+=Math.sign(dx);
				this.wl.legalize();
				this.mx-=32*Math.sign(dx);
			}
			if (this.my < 0 || this.my >= 32){
				this.wl.cy+=Math.sign(dy);
				this.wl.legalize();
				this.my-=32*Math.sign(dy);
			}
		}
		this.render = function(g){
			var dx = this.wl.dx(Trpg.board.cloc)*-32+this.container.container.camera.x+this.mx-Trpg.board.mx;
			var dy = this.wl.dy(Trpg.board.cloc)*-32+this.container.container.camera.y+this.my-Trpg.board.my;
			g.fillStyle = "brown";
			g.fillRect(dx-8,dy-8,16,16);
		}
	}*/
	this.World = function(seed){
		/*Trpg.imgs = {
			grass:Ast.i("grass"),
			tree:Ast.i("tree"),
			//appletree:Ast.i("appletree"),
			sapling:Ast.i("sapling"),
			seedling:Ast.i("seedling"),
			deadseedling:Ast.i("deadseedling"),
			stump:Ast.i("stump"),
			hole:Ast.i("hole"),
			ladderup:Ast.i("ladderup"),
			ladderdown:Ast.i("ladderdown"),
			dirt:Ast.i("dirt"),
			bportal:Ast.i("bportal"),
			gportal:Ast.i("gportal"),
			stone:Ast.i("stone"),
			cwallu:Ast.i("cwallu"),
			cwalll:Ast.i("cwalll"),
			cwallt:Ast.i("cwallt"),
			cwallx:Ast.i("cwallx"),
			cwallv:Ast.i("cwallv"),
			cwallc:Ast.i("cwallc"),
			tinore:Ast.i("tinore"),
			copperore:Ast.i("copperore"),
			blueore:Ast.i("blueore"),
			log:Ast.i("log"),
			firebig:Ast.i("firebig"),
			firesmall:Ast.i("firesmall"),
			ploweddirt:Ast.i("ploweddirt"),
			//applehole:Ast.i("applehole"),
			//rapplehole:Ast.i("rapplehole"),
			//bportal:Ast.i("bportal"),
			//gportal:Ast.i("gportal")
		}*/
		/*Board.container.add({health:20,maxhealth:20,render:function(g){
			g.fillStyle = "red";
			g.fillRect(Board.w+10,10,(Board.container.w-Board.w-20)*this.health/this.maxhealth,20);
		}},"healthbar");
		Board.container.add({count:0,render:function(g){
			g.fillStyle = "yellow";
			g.font = "25px Arial";
			g.fillText("Kill count: "+this.count,Board.w+10,60);
			//g.fillRect(Board.w+10,10,(Board.container.w-Board.w-20)*this.health/this.maxhealth,20);
		}},"killcounter");
		Board.container.add({apples:0,render:function(g){
			g.fillStyle = "red";
			g.font = "25px Arial";
			g.fillText("Apple basket: "+this.apples,Board.w+10,100);
			//g.fillRect(Board.w+10,10,(Board.container.w-Board.w-20)*this.health/this.maxhealth,20);
		}},"basket");*/
		//Trpg.Board.add(new UI.DBox(),"Birds");
		//Board.get("Birds").rl = 1;
		this.wseed = seed || Math.random();
		Trpg.world = this;
		Trpg.board = new Trpg.Board();
		Trpg.invent = new Trpg.Invent();
		/*
		Trpg.invent.additem(new Trpg.Item("IronOre"));
		Trpg.invent.additem(new Trpg.Item("IronOre"));
		Trpg.invent.additem(new Trpg.Item("IronOre"));
		Trpg.invent.additem(new Trpg.Item("IronOre"));
		Trpg.invent.additem(new Trpg.Item("IronOre"));
		Trpg.invent.additem(new Trpg.Item("IronOre"));
		Trpg.invent.additem(new Trpg.Item("IronOre"));
		Trpg.invent.additem(new Trpg.Item("IronOre"));
		Trpg.invent.additem(new Trpg.Item("IronOre"));
		Trpg.invent.additem(new Trpg.Item("MithrilOre"));
		Trpg.invent.additem(new Trpg.Item("CoalOre"));
		Trpg.invent.additem(new Trpg.Item("CoalOre"));
		Trpg.invent.additem(new Trpg.Item("CoalOre"));
		Trpg.invent.additem(new Trpg.Item("CoalOre"));
		Trpg.invent.additem(new Trpg.Item("CoalOre"));
		Trpg.invent.additem(new Trpg.Item("CoalOre"));
		Trpg.invent.additem(new Trpg.Item("CoalOre"));
		Trpg.invent.additem(new Trpg.Item("CoalOre"));
		Trpg.invent.additem(new Trpg.Item("CoalOre"));
		Trpg.invent.additem(new Trpg.Item("CoalOre"));
		Trpg.invent.additem(new Trpg.Item("CoalOre"));
		Trpg.invent.additem(new Trpg.Item("CoalOre"));
		Trpg.invent.additem(new Trpg.Item("CoalOre"));
		Trpg.invent.additem(new Trpg.Item("CoalOre"));
		Trpg.invent.additem(new Trpg.Item("CoalOre"));
		Trpg.invent.additem(new Trpg.Item("CoalOre"));
		Trpg.invent.additem(new Trpg.Item("CoalOre"));
		Trpg.invent.additem(new Trpg.Item("CoalOre"));
		/*Trpg.invent.additem(new Trpg.Item("BronzeBar"));
		Trpg.invent.additem(new Trpg.Item("IronBar"));
		Trpg.invent.additem(new Trpg.Item("SteelBar"));
		Trpg.invent.additem(new Trpg.Item("MithrilBar"));
		Trpg.invent.additem(new Trpg.Item("AdamantBar"));
		Trpg.invent.additem(new Trpg.Item("RuniteBar"));
		Trpg.invent.additem(new Trpg.Item("EterniumBar"));
		Trpg.invent.additem(new Trpg.Item("BronzeDagger"));
		Trpg.invent.additem(new Trpg.Item("BronzeHelm"));
		Trpg.invent.additem(new Trpg.Item("BronzeBody"));
		Trpg.invent.additem(new Trpg.Item("BronzeLegs"));
		Trpg.invent.additem(new Trpg.Item("BronzeKite"));
		Trpg.invent.additem(new Trpg.Item("IronBody"));
		Trpg.invent.additem(new Trpg.Item("SteelBody"));
		Trpg.invent.additem(new Trpg.Item("MithrilBody"));
		Trpg.invent.additem(new Trpg.Item("AdamantBody"));
		Trpg.invent.additem(new Trpg.Item("RuneBody"));
		Trpg.invent.additem(new Trpg.Item("EterniumBody"));
		Trpg.invent.additem(new Trpg.Item("DragonBody"));
		Trpg.invent.additem(new Trpg.Item("TinOre"));
		Trpg.invent.additem(new Trpg.Item("CopperOre"));
		Trpg.invent.additem(new Trpg.Item("CoalOre"));
		Trpg.invent.additem(new Trpg.Item("IronOre"));
		Trpg.invent.additem(new Trpg.Item("MithrilOre"));
		Trpg.invent.additem(new Trpg.Item("AdamantOre"));
		Trpg.invent.additem(new Trpg.Item("RuniteOre"));
		Trpg.invent.additem(new Trpg.Item("EterniumOre"));
		Trpg.invent.additem(new Trpg.Item("Hammer"));//*/
		//Trpg.invent.additem(new Trpg.Item("Hoe"));
		//Trpg.invent.additem(new Trpg.Item("Hammer"));
		//Trpg.invent.additem(new Trpg.Item("Ladder"));
		/*Trpg.invent.additem(new Trpg.Item("Log"));
		Trpg.invent.additem(new Trpg.Item("Log"));
		Trpg.invent.additem(new Trpg.Item("Log"));
		Trpg.invent.additem(new Trpg.Item("Log"));
		Trpg.invent.additem(new Trpg.Item("Log"));
		Trpg.invent.additem(new Trpg.Item("Log"));
		Trpg.invent.additem(new Trpg.Item("Log"));
		Trpg.invent.additem(new Trpg.Item("Log"));
		Trpg.invent.additem(new Trpg.Item("Log"));
		Trpg.invent.additem(new Trpg.Item("Log"));
		Trpg.invent.additem(new Trpg.Item("Log"));
		Trpg.invent.additem(new Trpg.Item("Log"));
		Trpg.invent.additem(new Trpg.Item("Log"));
		Trpg.invent.additem(new Trpg.Item("Log"));
		Trpg.invent.additem(new Trpg.Item("Log"));
		Trpg.invent.additem(new Trpg.Item("Log"));
		Trpg.invent.additem(new Trpg.Item("Log"));*/
		this.changed = [];
		this.changes = {};
		this.loadChanges = function(changes){
			//this.changed = 
			//console.log(changes);
			this.changed = changes.changed;
			this.changes = changes.changes;
			this.wseed = changes.seed;
			//console.log(changes);
			//var und;
			
			//taken out to avoid duplicate toolboxes
			//Trpg.board.init();
			
			
			//console.log(changes.ploc);
			//console.log(new Trpg.WorldLoc().copy());
			Trpg.bank = {contents:changes.bank};
			Trpg.board.cloc.load(changes.cloc);
			Trpg.board.loaded = [];
			Trpg.board.load(Trpg.board.cloc,true);
			//Trpg.invent = new Trpg.Invent();
			//console.log(changes.invent);
			Trpg.Map.load(changes.map);
			Trpg.invent.loadsave(changes.invent);
		}
		this.getChanges = function(){
			Trpg.board.save();
			var d = new Trpg.WorldLoc(0,0,3,3).dist(Trpg.board.cloc);
			//var d = Trpg.board.player.firstloc.dist(Trpg.board.cloc);
			//if (this.changes.length == 0 && d == 0){
			//	alert("swdefr");
			//	return "none"
			// }
				//return "none";
			var loc = (Trpg.board.cloc.copy());
			return {
				changed:this.changed,
				changes:this.changes,
				seed:this.wseed,
				bank:Trpg.bank.contents,
				cloc:loc,
				invent:Trpg.invent.getsave(),
				map:Trpg.Map.save()
			}
		}
	}
	/*function Player(wl){
		this.loc = wl || new Trpg.WorldLoc(0,0,3,3);
		this.mx = this.my = 16;
		/*return {
				/*img:{
					n:Ast.i("playerN"),
					s:Ast.i("playerS"),
					e:Ast.i("playerE"),
					w:Ast.i("playerW")
				},*
				loc:wl||new Trpg.WorldLoc(0,0,3,3),
				mx:16,my:16,
				/*tool:"none",
				settool:function(toool,rmin,rmax){
					this.tools[toool] = {rmin:rmin,rmax:rmax,action:toool}
				},
				gettool:function(){
					return this.tools[this.tool];
				},
				inRange:function(wl){
					var d = this.loc.dist(wl);
					return this.gettool().rmin <= d && this.gettool().rmax >= d && this.tool != "none";
				},
				tools:{}*
			};*
	}*/
	function sameState(s1, s2){
		s1 = JSON.stringify(s1);
		s2 = JSON.stringify(s2);
		return s1===s2;
	}
	function copyObjTo(src,target){
		for (var p in src)
			if (src.hasOwnProperty(p))
				target[p] = src[p];
	}
	function amt2text(amt){
		var text = amt;
		var mod = "";
		if (text >= Math.pow(10,10))
			return Math.floor(text/1000000000)+"b";
		if (text >= Math.pow(10,7))
			return Math.floor(text/1000000)+"m";
		if (text >= Math.pow(10,5))
			return Math.floor(text/1000)+"k";
		return ""+text;
	}
	this.Invent = function(){
		this.spaces = [];
		this.selected = -1;
		this.using = -1;
		this.withdrawing = -1;
		this.size = 35;
		var sx = 0;
		var sy = 1;
		for (var i = 0; i < this.size; i++)
			this.spaces.push("empty");
		this.mousemove = function(e,m){
			if (!this.container.mouseonbox(m))
				return;
			var x = Math.floor((this.container.boxx(m.x)-sx*2)/64);
			var y = Math.floor((this.container.boxy(m.y)-sy*2)/64);
			if (x<0||x>4||y<0||y>6||x+5*y<0||x+5*y>34)
				return this.aim = "empty";
			//if (x+5*y>34 || x+5*y < 0)	return;
			this.aim = x+5*y;
		}
		this.getaim = function(){
			if (this.aim == "empty")	return "empty";
			return this.spaces[this.aim];
		}
		this.getspace = function(m){
			var x = Math.floor((this.container.boxx(m.x)+sx)/64);
			var y = Math.floor((this.container.boxy(m.y)+sy)/64);
			//var x = Math.floor((m.relx(Trpg.Home.get("Gameplay.Invent"))-25)/Trpg.Home.get("Gameplay.Invent").cumZoom()/64)
			//var y = Math.floor((m.rely(Trpg.Home.get("Gameplay.Invent"))-15)/Trpg.Home.get("Gameplay.Invent").cumZoom()/64);
			if (x<0||x>4||y<0||y>6)
				return -1;
			return x+5*y;
		}
		this.getitem = function(s){
			if (s<0||s>34)	return -1;
			return this.spaces[s];
		}
		this.additem = function(item,amt){
			if (amt == 0) return;
			amt = amt || item.amt;
			if (item.stackable){
				for (var i = 0; i < this.size; i++)
					if (this.spaces[i].type == item.type){
						this.spaces[i].amt+=amt;
						item.space = i;
						return;
					}
				for (var i = 0; i < this.size; i++)
					if (this.spaces[i]=="empty"){
						item.amt = amt;
						this.spaces[i] = item;
						item.space = i;
						return;
					}
				return;
			}
			for (var i = 0; i < this.size && amt > 0; i++)
				if (this.spaces[i]=="empty"){
					this.spaces[i] = item.copy();
					this.spaces[i].space = i;
					amt--;
					//console.log(amt);
				}
			/*if (this.getempty() < amt)	return;
			for (var i = 0; i < this.size && amt > 0; i++)
				if (this.spaces[i]=="empty"){
					this.spaces[i] = item;
					item.space = i;
					amt--;
				}*/
		}
		this.getsave = function(){
			var save = [];
			for (var i = 0; i < this.size; i++)
				if (this.spaces[i] == "empty")
					save.push("empty");
				else save.push({t:this.spaces[i].type,a:this.spaces[i].amt});
			return JSON.stringify(save);
		}
		this.loadsave = function(load){
			var save = JSON.parse(load);
		//	console.log(save);
			this.using = -1;
			for (var i = 0; i < this.size; i++)
				if (save[i] !== "empty" && exists(save[i].t)){
					//console.log(save[i]);
					this.spaces[i] = new Trpg.Item(save[i].t);
					this.spaces[i].amt = save[i].a;
					this.spaces[i].space = i;
				} else if (save[i] == "empty")
					this.spaces[i] = "empty";
				
			//for (var i = 0; i < 35; i++)
			//	console.log(this.spaces[i].space);
			/*if (!this.hasitem("Tinderbox"))
				this.additem(new Trpg.Item("Tinderbox"));
			if (!this.hasitem("Hoe"))
				this.additem(new Trpg.Item("Hoe"));*/
		}
		this.getempty = function(){
			var empty = 0;
			for (var i = 0; i < this.size; i++)
				if (this.spaces[i] == "empty")
					empty++;
			return empty;
		}
		this.hasitem = function(item,amt){
			amt = amt || 1;
			for (var i = 0; i < this.size; i++)
				if (this.spaces[i].type == item)
					amt-=this.spaces[i].amt;
			return amt <= 0;
		}
		this.getitemamt = function(item){
			for(var i = 0; i < this.size; i++)
				if (!this.hasitem(item,i))
					return i;
		}
		this.dropitem = function(item){
			Trpg.board.ground.dropitem(item,Trpg.board.cloc);
			if (!item.infinite)
				this.spaces[item.space] = "empty";
		}
		this.pickupitem = function(item,wl){
			var items = Trpg.board.ground.items[wl.toStr()];
		//	console.log(items);
			//console.log(item);
			for (var i = 0; i < items.length; i++)
				if (items[i].item == item)
					return this.additem(items.splice(i,1)[0].item);
		}/*
		this.deleteitem = function(item){
			if (typeof item == "string"){
				for (var i = 0; i < this.size; i++)
					if (this.spaces[i] !== "empty" && this.spaces[i].type == item){
						this.spaces[i] = "empty";
						return;
					}
			}
			else this.spaces[item.space] = "empty";
		}*/
		this.removeitem = function(item,amt){
			if (item.infinite)	return;
			amt = amt || 1;
			if (typeof item !== "string"){
				if (item.stackable){
					item.amt-=amt;
					if (item.amt <= 0)
						this.spaces[item.space] = "empty";
					return;
				}
				//for (var i = 0; i < this.size && amt > 1; i++)
					
				this.spaces[item.space] = "empty";
				return;
			}
			for (var i = 0; i < this.size && amt > 0; i++)
				if (this.spaces[i] !== "empty" && this.spaces[i].type == item){
					this.spaces[i] = "empty";
					amt--;
				}
			return;
			
				for (var i = 0; i < this.size && amt > 0; i++)
					if (this.spaces[i] !== "empty"){
						if (typeof item == "string"){
							if (this.spaces[i].type == item)
								item = this.spaces[i];
							else continue;
						}
						//item = this.spaces[i];
						if (item.stackable){
							if (item.atm > amt)
								item.amt-=amt;
							else 
								this.spaces[item.space] = "empty";
							return;
						}
						else {
							this.spaces[item.space] = "empty";
							amt--;
						}
						/*
						if (item.amt <= 0){
							this.spaces[i] = "empty"
							if (item.stackable){
								item.amt = amt;
								break;
							}
							else item.amt = 1;
						}
						if (amt <= 0)
							break;*/
					}
					
					return;
			while (amt > 0){
				if (typeof item == "string"){
					for (var i = 0; i < this.size; i++)
						if (this.spaces[i] !== "empty" && this.spaces[i].type == item){
							this.spaces[i].amt--;
							break;
						}
				}
				else 	this.spaces[item.space].amt--;
				for (var i = 0; i < this.size; i++)
					if (this.spaces[i] !== "empty" && this.spaces[i].amt < 1)// && !this.spaces[i].infinite)
							this.spaces[i] = "empty";
				amt--;
			}
			
		}
		this.render = function(g){
			this.mousemove("blah",Ms.getMouse());
			g.lineWidth = 1;
			g.translate(sx*2,sy*2);
			for (var i = 0; i < this.size; i++){
				g.save();
				 if (this.using !==-1)console.log(this.using);
				if ((this.using !==-1 && this.using.space == i)
				|| (this.withdrawing !==-1 && this.spaces[i] !== "empty"))
					g.strokeStyle = "white";
				g.translate(64*Math.floor(i%5),64*Math.floor(i/5));//+64*Math.floor(i%5),20+64*Math.floor(i/5),62,62);
				//g.strokeStyle = "black";
				g.scale(2,2);
				if (this.spaces[i] !== "empty")
					this.spaces[i].render(g,0,0);//+32*Math.floor(i%5),10+32*Math.floor(i/5));
				g.strokeRect(0,0,31,31);
				//g.translate(20,10);
				if (Trpg.Home.get("Gameplay").has("currentaction")
					&&!Trpg.Home.get("Gameplay.currentaction").board
					&&Trpg.Home.get("Gameplay.currentaction").space==i)
					Trpg.Home.get("Gameplay.currentaction").renderp(g);
				g.scale(1/2,1/2);
				g.restore();
			}
		}
	}
	this.Item = function(type){
		function Default(){
			this.type = "default";
			this.alchable = true;
			this.alchvalue = 0;
			this.board = false;
			this.stackable = false;
			this.infinite = false;
			this.setinfinite = function(inf){
				this.infinite = inf;
				return this;
			}
			this.copy = function(){
				return new Trpg.Item(this.type).sets(this);
			}
			this.getstate = function(){	return this.type}
			this.actions = ["use","drop"];
			this.amt = 1;
			this.setamt = function(amt){
				this.amt = amt;
				return this;
			}
			this.useon = function(on){
				console.log("rvet")
				console.log(Trpg.invent.using);
				if (on.type == "Chest" || on.type == "BankChest"){
					on.additem(Trpg.invent.using);
					Trpg.invent.removeitem(Trpg.invent.using,Trpg.invent.using.amt);
				}
				Trpg.invent.using = -1;
			}
			this.doaction = function(action){
				if (!exists(action))	action = this.getActions()[0];
				switch (action){
					case "use":
						Trpg.invent.using = this;
						//console.log(Trpg.invent.using);
						break;
					case "drop":
						Trpg.invent.dropitem(this);
						break;
				}
			}
			this.fillmenu = function(menu){
				menu.removeall();
				var that = this;
				if (Trpg.invent.using !== -1){
					menu.additem(function(){
						Trpg.invent.using.useon(that);
						return "close,empty";
					},Trpg.invent.using.type+" -> "+that.type);
					return;
					/*(function(a){return function(){
						Trpg.invent.pickupitem(a,that.wl.copy());
						return "remove";
						//that.doaction(items[a]);
						//return "close";
					};})((function(b){return items[b].item})(i))
					//items[i].item)
					,items[i].item.type,"orange");*/
				}
				var actions = [];
				for (var i = 0; i < this.actions.length; i++)
					actions.push(this.actions[i]);
				if (K.Keys.shift.down && actions.indexOf("drop")!==-1)
					actions.unshift(actions.splice(actions.indexOf("drop"),1)[0]);
				for (var i = 0; i < actions.length; i++)
					menu.additem((function(a){return function(){
						that.doaction(actions[a]);
						return "close";
						};})(i),actions[i].charAt(0).toUpperCase()+actions[i].substring(1));
			}
			this.getActions = function(){	return this.actions;	}
			this.hasAction = function(action){	return this.getActions().indexOf(action)!=-1;}
			this.render = function(g,x,y){
				g.drawImage(Ast.i(this.type.toLowerCase()),x,y);
				g.font = "8px Arial";
				g.fillStyle = "yellow";
				var text = amt2text(this.amt);
				if (text.indexOf("b")!==-1)	g.fillStyle = "cyan";
				if (text.indexOf("m")!==-1)	g.fillStyle = "#41DB00";
				if (text.indexOf("k")!==-1)	g.fillStyle = "white";
				
				if (this.stackable)
					g.fillText(text,x+2,y+7);
			}
		}
		var items = {
			Coins:function(){
				this.type = "Coins";
				this.stackable = true;
				this.alchable = false;
				return this;
			},
			Log:function(){
				this.type = "Log";
				var that = this;
				this.useon = function(on){
					Trpg.invent.using = -1;
				if (on.type == "Chest" || on.type == "BankChest"){
					on.additem(Trpg.invent.using);
					Trpg.invent.removeitem(Trpg.invent.using);
				}
					switch (on.type){
						case "Tinderbox":
							this.doaction("light");
							break;
						case "FireSmall":
							//var timer = new Utils.Timer(1).start().setAuto(true,function(){
								on.doaction("fuel");
								//Trpg.board.setTile(new Trpg.Tile("FireBig"),on.wl);
								Trpg.invent.removeitem(that);
							break;
							// }).setKilloncomp(true);
							//timer.board = false;
							//timer.space = this.space;
							//Trpg.Home.add(timer,"Gameplay.currentaction");
					}
				}
				this.doaction = function(action){
					if (!exists(action))	action = this.getActions()[0];
					switch (action){
						case "light":
							if (!Trpg.board.getTile(Trpg.board.cloc).getTrait("burnable"))
								return;
							var timer = new Utils.Timer(1.3).start().setAuto(true,function(){
								Trpg.board.setTile(new Trpg.Tile("FireBig"),Trpg.board.cloc);
								Trpg.invent.removeitem(that);
							}).setKilloncomp(true);
							timer.board = false;
							timer.space = this.space;
							Trpg.Home.add(timer,"Gameplay.currentaction");
							//Trpg.board.setTile(Hole.call(new Default()),this.wl);
							break;
						case "use":
							Trpg.invent.using = this;
							break;
						case "drop":
							Trpg.invent.dropitem(this);
							break;
					}
				}
				return this;
			},
			Seed:function(){
				this.type = "Seed";
				var that = this;
				this.stackable = true;
				this.actions = ["use","drop"];
				this.useon = function(on){
					Trpg.invent.using = -1;
				if (on.type == "Chest" || on.type == "BankChest"){
					on.additem(Trpg.invent.using);
					Trpg.invent.removeitem(Trpg.invent.using);
				}
					switch (on.type){
						case "Hole":
							on.doaction("plant");
							Trpg.invent.removeitem(this);
							break;
					}
				}
				this.render = function(g,x,y){
					g.fillStyle = "yellow";
					g.fillText("Seed",x+5,y+20);
					if (this.stackable)
						g.fillText(this.amt,x+5,y+10);
				}
				return this;
			},
			//{ores
			Ore:function(type,alch){
				this.type = type+"Ore";
				return this;
			},
			TinOre:function(){return items.Ore.call(this,"Tin",2)},
			CopperOre:function(){return items.Ore.call(this,"Copper",2)},
			CoalOre:function(){/*this.stackable = true;*/return items.Ore.call(this,"Coal",20)},
			IronOre:function(){return items.Ore.call(this,"Iron",10)},
			MithrilOre:function(){return items.Ore.call(this,"Mithril",120)},
			AdamantOre:function(){return items.Ore.call(this,"Adamant",250)},
			RuniteOre:function(){return items.Ore.call(this,"Runite",2000)},
			EterniumOre:function(){return items.Ore.call(this,"Eternium",10000)},
			//}
			//{bars
			Bar:function(type,alch){
				this.type = type+"Bar";
				this.alchvalue = alch;
				var metals = {
					EterniumBar:[{t:"EterniumOre",a:1},{t:"CoalOre",a:12}],
					RuniteBar:[{t:"RuniteOre",a:1},{t:"CoalOre",a:8}],
					AdamantBar:[{t:"AdamantOre",a:1},{t:"CoalOre",a:6}],
					MithrilBar:[{t:"MithrilOre",a:1},{t:"CoalOre",a:4}],
					SteelBar:[{t:"IronOre",a:1},{t:"CoalOre",a:2}],
					IronBar:[{t:"IronOre",a:1}],
					BronzeBar:[{t:"TinOre",a:1},{t:"CopperOre",a:1}],
				}
				this.cansmelt = function(){
					//console.log(this.type);
					var reqs = metals[this.type];
					for (var i = 0; i < reqs.length; i++)
						if (!Trpg.invent.hasitem(reqs[i].t,reqs[i].a))
							return false;
						return true;
				}
				this.smelt = function(furnace){
					var that = this;
					var wl = furnace.wl;
					var timer = new Utils.Timer(1.3).start().setLoop(true).setAuto(true,function(){
						timer.setKilloncomp(true);
						var reqs = metals[that.type];
						for (var i = 0; i < reqs.length; i++)
							Trpg.invent.removeitem(reqs[i].t,reqs[i].a);
						if (that.type !== "IronBar" || Math.random()>.5)
						Trpg.invent.additem(new Trpg.Item(that.type));
						if (that.cansmelt())	timer.setKilloncomp(false);
					});
					timer.board = true;
					timer.wl = wl;
					Trpg.Home.add(timer,"Gameplay.currentaction");
				}
				return this;
			},
			BronzeBar:function(){return items.Bar.call(this,"Bronze",4)},
			IronBar:function(){return items.Bar.call(this,"Iron",16)},
			SteelBar:function(){return items.Bar.call(this,"Steel",60)},
			MithrilBar:function(){return items.Bar.call(this,"Mithril",180)},
			AdamantBar:function(){return items.Bar.call(this,"Adamant",375)},
			RuniteBar:function(){return items.Bar.call(this,"Runite",3000)},
			EterniumBar:function(){return items.Bar.call(this,"Eternium",15000)},
			//}
			//{weapons
			Weapon:function(metal,type){
				this.type = metal+type;
				return this;
			},
			BronzeDagger:function(){return items.Weapon.call(this,"Bronze","Dagger");},
			IronDagger:function(){return items.Weapon.call(this,"Iron","Dagger");},
			SteelDagger:function(){return items.Weapon.call(this,"Steel","Dagger");},
			MithrilDagger:function(){return items.Weapon.call(this,"Mithril","Dagger");},
			AdamantDagger:function(){return items.Weapon.call(this,"Adamant","Dagger");},
			RuneDagger:function(){return items.Weapon.call(this,"Rune","Dagger");},
			EterniumDagger:function(){return items.Weapon.call(this,"Eternium","Dagger");},
			//}
			//{armor
			Armor:function(metal,type){
				this.type = metal+type;
				return this;
			},
			BronzeHelm:function(){return items.Weapon.call(this,"Bronze","Helm");},
			BronzeBody:function(){return items.Weapon.call(this,"Bronze","Body");},
			BronzeLegs:function(){return items.Weapon.call(this,"Bronze","Legs");},
			BronzeKite:function(){return items.Weapon.call(this,"Bronze","Kite");},
			IronHelm:function(){return items.Weapon.call(this,"Iron","Helm");},
			IronBody:function(){return items.Weapon.call(this,"Iron","Body");},
			IronLegs:function(){return items.Weapon.call(this,"Iron","Legs");},
			IronKite:function(){return items.Weapon.call(this,"Iron","Kite");},
			SteelHelm:function(){return items.Weapon.call(this,"Steel","Helm");},
			SteelBody:function(){return items.Weapon.call(this,"Steel","Body");},
			SteelLegs:function(){return items.Weapon.call(this,"Steel","Legs");},
			SteelKite:function(){return items.Weapon.call(this,"Steel","Kite");},
			MithrilHelm:function(){return items.Weapon.call(this,"Mithril","Helm");},
			MithrilBody:function(){return items.Weapon.call(this,"Mithril","Body");},
			MithrilLegs:function(){return items.Weapon.call(this,"Mithril","Legs");},
			MithrilKite:function(){return items.Weapon.call(this,"Mithril","Kite");},
			AdamantHelm:function(){return items.Weapon.call(this,"Adamant","Helm");},
			AdamantBody:function(){return items.Weapon.call(this,"Adamant","Body");},
			AdamantLegs:function(){return items.Weapon.call(this,"Adamant","Legs");},
			AdamantKite:function(){return items.Weapon.call(this,"Adamant","Kite");},
			RuneHelm:function(){return items.Weapon.call(this,"Rune","Helm");},
			RuneBody:function(){return items.Weapon.call(this,"Rune","Body");},
			RuneLegs:function(){return items.Weapon.call(this,"Rune","Legs");},
			RuneKite:function(){return items.Weapon.call(this,"Rune","Kite");},
			EterniumHelm:function(){return items.Weapon.call(this,"Eternium","Helm");},
			EterniumBody:function(){return items.Weapon.call(this,"Eternium","Body");},
			EterniumLegs:function(){return items.Weapon.call(this,"Eternium","Legs");},
			EterniumKite:function(){return items.Weapon.call(this,"Eternium","Kite");},
			DragonBody:function(){return items.Weapon.call(this,"Dragon","Body");},
			//}
			Ladder:function(){
				this.type = "Ladder";
				this.render = function(g,x,y){
					g.drawImage(Ast.i("ladderup"),x,y);
				}
				return this;
			},
			Tinderbox:function(){
				this.type = "Tinderbox";
				this.useon = function(on){
					Trpg.invent.using = -1;
				if (on.type == "Chest" || on.type == "BankChest"){
					on.additem(Trpg.invent.using);
					Trpg.invent.removeitem(Trpg.invent.using);
				}
					switch (on.type){
						case "Log":
							on.doaction("light");
							break;
					}
				}
				this.render = function(g,x,y){
					g.fillStyle = "yellow";
					g.fillText("Tind",x+5,y+20);
				}
				return this;
			},
			Hoe:function(){
				this.type = "Hoe";
				this.actions = ["use"];
				this.useon = function(on){
					Trpg.invent.using = -1;
					switch (on.type){
						case "Grass":
							on.doaction("plow");
							break;
					}
				}
				this.doaction = function(action){
					if (!exists(action))	action = this.getActions()[0];
					switch (action){
						case "use":
							Trpg.invent.using = this;
							break;
						//case "drop":
						//	Trpg.invent.dropitem(this);
						//	break;
					}
				}
				this.render = function(g,x,y){
					g.fillStyle = "yellow";
					g.fillText("Hoe",x+5,y+20);
					if (this.stackable)
						g.fillText(this.amt,x+5,y+10);
				}
				return this;
			},
			Hammer:function(){
				this.type = "Hammer";
				return this;
			},
			Knife:function(){
				this.type = "Knife";
				this.useon = function(on){
				if (on.type == "Chest" || on.type == "BankChest"){
					on.additem(Trpg.invent.using);
					Trpg.invent.removeitem(Trpg.invent.using);
				}
					Trpg.invent.using = -1;
					if (on.type !== "Log")return;// || !Trpg.invent.hasitem("Log",5))	return;
					//alert("wassup doc");
					var menu = new Trpg.Menu();//Trpg.toolbox.menu;
					//menu.removeall();
					menu.additem(function(){
						if (Trpg.invent.hasitem("Log",5)){
							Trpg.invent.removeitem("Log",5);
							Trpg.invent.additem(new Trpg.Item("Ladder"));
						}/* else {
							Trpg.board.container.add(new feedback("You need 5 logs for this",
							10,10),"feedback");
							//Trpg.board.cloc.dx(wl)*32+16+Trpg.board.container.camera.x,
							//Trpg.board.cloc.dy(wl)*32+Trpg.board.container.camera.y,1.5),"feedback");
						}*/
						return "delete";
					},"Ladder 5 logs","#703D00");
					var c = Trpg.toolbox;
					menu.open(c.boxx(Ms.x())-15,c.boxy(Ms.y())-15);
					c.add(menu,"othermenu");
				}
				return this;
			}
		}
		return items[type].apply(new Default());
		//console.log(i);
		//return i;
	}
	this.Map = new (function(){
		/*this.chunks = [];
		this.addchunk = function(chunk){
			this.chunks.push({
				wl:chunk.wl.copy(),
				img:chunk.getimg()
			})
		}*/
		this.save = function(){
			var loaded = [];
			for (var p in this.tiles)
				loaded.push({wl:p,t:this.tiles[p]});
				//loaded.push(JSON.stringify(this.tiles[p].wl));
			return loaded;
		}
		this.load = function(loads){
			for (var i = 0; i < loads.length; i++)
				this.tiles[loads[i].wl] = loads[i].t;
				//this.addtile(Trpg.board.getTile(JSON.parse(loads[i])));
		}
		this.tiles = {};
		this.addtile = function(tile){
			var t = this.tiles[tile.wl.toStr()];
			if (!exists(t))
				this.tiles[tile.wl.toStr()] = {c:tile.getcolor(),v:tile.wl.dist(Trpg.board.cloc)<=Trpg.board.viewsize};
			else this.tiles[tile.wl.toStr()].c = tile.getcolor();
			//if (!exists(this.tiles[tile.wl.toStr()])
			//var o = {wl:tile.wl,col:tile.getcolor()};
			//if (this.tiles.indexOf(o) == -1)
			//	this.tiles.push(o);
		}
		this.init = function(){
		//	this.rl = 1;
			this.r = 34;
			this.s = 6;
			this.container.camera.centerZero();
			//this.invisible = true;
		}
		this.mousedown = function(e,m){
			if (e.button !== 0)	return;
			if (this.container.mouseonbox(m)){
				//this.container.fullscreen = !this.container.fullscreen;
				
			//Trpg.board.setTile(new Trpg.Tile("Chest"),new Trpg.WorldLoc(-1,1,5,5));return;
				if (this.container.fullscreen){
					this.r = 34;
					this.s = 6;
					this.container.x = 800;
					this.container.y = 0;
					this.container.w = 400;
					this.container.h = 300;
					this.container.camera.reset();
					this.container.camera.centerZero();
					Trpg.Home.get("Gameplay.Menus").invisible = false;
					
				} else {//*
					this.r = 41;
					this.s = 10;
					this.container.x = 0;
					this.container.y = 0;
					this.container.w = 800;
					this.container.h = 800;
					this.container.camera.reset();
					this.container.camera.centerZero();//*/
					Trpg.Home.get("Gameplay.Menus").invisible = true;
				//alert("clicked on"+this.container.systemname);
				//	Trph.board.invisible = true;
				}
				this.container.fullscreen = !this.container.fullscreen;
				return true;
			}
		}
		this.render = function(g){
			g.translate(-Trpg.board.cloc.mx*this.s/32,-Trpg.board.cloc.my*this.s/32);
			for (var i = -this.r; i < this.r; i++)
				for (var j = -this.r; j < this.r; j++){
					var wl = Trpg.board.cloc.copy().shift(i,j);
					var t = this.tiles[wl.toStr()];
					if (!exists(t))	continue;
					if (!t.v && Trpg.board.cloc.dist(wl)<=Trpg.board.viewsize)	t.v = true;
					if (!t.v)		continue;
					g.fillStyle = t.c;
					//g.fillStyle = Trpg.board.getTile().getcolor();
					g.fillRect(this.s*i,this.s*j,this.s+1,this.s+1);
				}
			g.translate(Trpg.board.cloc.mx*this.s/32,Trpg.board.cloc.my*this.s/32);
			g.fillStyle = "white";
			g.fillRect(-this.s/2,-this.s/2,this.s+1,this.s+1);
		}
	})();
	function feedback(str,x,y,l){
		var sx = x;
		var sy = y;
		this.init = function(){
			this.timer = new Utils.Timer(l||2).start();
			this.rl = 2;
			/*var timer = new Utils.Timer(delay).start().setAuto(true,function(){
				infunc();
			}).setKilloncomp(true);*/
		}
		this.update = function(d){
			this.timer.update(d);
			if (this.timer.consume())
				this.container.remove(this);
		}
		this.render = function(g){
			var x = sx;
			var y = sy;
			if (this.container.systemname=="Board"){
				x-=Trpg.board.cloc.mx;
				y-=Trpg.board.cloc.my;
			}
			//g.font = "20px Arial";
			var w = g.measureText(str).width+5;
			var h = g.measureText("M").width+5;
			g.fillStyle = "white";
			g.globalAlpha = .5;
			g.fillRect(x-w/2,y-h/2,w,h);
			g.globalAlpha = 1;
			g.fillStyle = "black";
			//Drw.drawCText(g,str,sx-Trpg.board.mx,sy-Trpg.board.my);
			//g.font = (parseInt(g.font.substring(0,g.font.indexOf("px")))-1)+g.font.substring(g.font.indexOf("px"));
			//g.fillStyle = "white";
			Drw.drawCText(g,str,x,y);
		}
	}
	this.Menu = function(x,y,w,h){
		var menu = new UI.DBox(x,y,w,h);
		menu.exitonclose = false;
		menu.itemcount = 0;
		menu.setheader = function(text,color){
			var btn = new UI.Button(0,0,20,45);
			btn.sets({isOver:function(){return false},text:text,color:color||btn.color});
			menu.h+=45;
			menu.add(btn,"header");
		}
		menu.additem = function(onclick,text,color){
			var btn = new UI.Button(0,menu.h,20,45);
			var click = function(){
				onclick && menu.removeitem(this,onclick());
				//onclick && menu.removeitem(this,onclick());
			}
			btn.sets({onclick:click,text:text,color:color||btn.color});
			menu.h+=45;
			menu.add(btn,"item"+(menu.itemcount++));
		}
		menu.onempty = function(){};
		menu.getactive = function(){
			var count = 0;
			for (var i = 0; i < menu.itemcount; i++)
				if (menu.has("item"+i))
					count++;
			return count;
		}
		menu.removeitem = function(item,modifier){
			if (typeof modifier !== "string")	return;
			if (modifier.indexOf("remove")!==-1){
				var q = menu.getq();
				if (modifier.indexOf("tremove")!==-1)
					item.hidden = true;
				else {
				//	console.log(item);
					menu.remove(item);
					//menu.itemcount--;
					//q = menu.getq();
					//for (var j = 0; j < menu.itemcount; j++)
					//	if (!menu.has("item"+j))
					//		for (var i = j; i < menu.itemcount; i++)
					//			menu.get("item"+i).systemname = "item"+(i-1);
					/*var j = 0;
					for (var p in q){
						console.log(q[p]);
						if (q[p].systemname && q[p].systemname.indexOf("item")!==-1)
							if (parseInt(q[p].systemname.substring(4)) > j)	q[p].systemname = "item"+(j--);
					}*/
				}
				for (var i = parseInt(item.systemname.substring(4)); i < menu.itemcount; i++)
					if (menu.has("item"+i)){
						menu.get("item"+i).y-=45;
						//menu.get("item"+i).systemname = "item"
						//menu.h-=45;
					}
				if (false){	
				for (var p in q){
					if (q[p].systemname && q[p].systemname.indexOf("item")!==-1 && 
						parseInt(q[p].systemname.substring(4)) >= parseInt(item.systemname.substring(4))){
							q[p].y-=45;
					}
				}}
					//for (var p in q)
					//	console.log(q[p].systemname);
			}
			if (modifier.indexOf("close")!==-1)
				menu.close(modifier.indexOf("empty")!==-1);
			if (modifier.indexOf("empty")!==-1)
				menu.removeall();
			for (var i = 0, j = 0; i < menu.itemcount; i++)
				if (menu.has("item"+i))j++;
			if (j == 0)
				menu.onempty();
			if (modifier.indexOf("delete")!==-1)
				menu.container.remove(menu);
		}
		menu.removeall = function(){
			if (menu.has("header"))
				menu.remove("header");
			for (var i = 0; i < menu.itemcount; i++)
				if (menu.has("item"+i))
				menu.remove("item"+i);
			menu.itemcount = menu.h = 0;
			menu.onempty();
			return;
			var q = menu.getq();
			for (var p in q)
				if (q[p].systemname && q[p].systemname.indexOf("item")!==-1)
					menu.remove(q[p]);
			menu.itemcount = menu.h = 0;
				//console.log(q[p].systemname);
		}
		menu.adjwidths = function(g){
			//console.log("D2w34gtyh");
			var x = menu.x;
			var y = menu.y;
			var max = 0;
			menu.h = 0;
			menu.w = 0;
			if (this.has("header")){
				var h = this.get("header")
				h.y =0;//-45;//menu.h;
				h.adjust(g);
				menu.h+=45;
				if (h.w>max)
					max = h.w;
				//menu.h+=45;
				//menu.y-=45;
			}
			for (var i = 0; i < menu.itemcount; i++){
				if (!menu.has("item"+i))
					continue;
				var item = menu.get("item"+i);
				item.y = menu.h;
				menu.h+=45;
				item.adjust(g);
				if (item.w>max)
					max = item.w;
			}
			//	menu.h-=45;
			if (menu.has("header"))
				menu.get("header").w = max;
			for (var i = 0; i < menu.itemcount; i++)
				if (menu.has("item"+i))
				menu.get("item"+i).w = max;
			
			menu.w = max;
			var cc= Trpg.Home;
			while (cc.boxx(menu.screenx(menu.w))>cc.w&&cc.boxx(menu.screenx(menu.w))>0)	menu.x--;
			while (cc.boxy(menu.screeny(menu.h))>=cc.h&&cc.boxy(menu.screeny(menu.y))>0)	menu.y--;
			//while (cc.boxx(menu.screenx(menu.x))<0)	menu.x++;
			//while (cc.boxy(menu.screeny(menu.y))<90)	menu.y++;
			if (cc.boxy(menu.screeny(menu.h))>cc.h){
				//menu.x = x-max/2;
				//menu.w*=2;//=max*2;
				menu.w = max;
				var h = 0;
				if (menu.has("header")){
					h = 45;
					menu.get("header").x=max/2;
				}
				for (var i = 0, w = max; i < menu.itemcount; i++)
					if (menu.has("item"+i)){
						var item = menu.get("item"+i);
						item.x = 0;//menu.x;//-max;
						//if (item.y+45<menu.h)continue;
						if (cc.boxy(menu.screeny(item.y+45))<cc.h)continue;
						menu.w = w;
						item.x+=menu.w;
						item.y = h;
						h+=45;
						if (cc.boxy(menu.screeny(h+45+menu.y))>cc.h){
							menu.h = h;
							h = 0;
							w+=max;
							if (menu.has("header")){
								h+=45;
								menu.get("header").x+=max/2;
							}
							//menu.w+=max;
							//menu.x-=max/2;
						}
					}
					menu.w+=max;
			} //else console.log("FDWErgthyj")
			//menu.x -= menu.w/2;
			//while (cc.boxx(menu.screenx(menu.x+menu.w))>cc.w&&cc.boxx(menu.screenx(menu.x+menu.w))>0)	menu.x--;
		}
		menu.add({rl:1,mousemove:function(e,m){
			if (!menu.mouseonbox(m))
				menu.close();
		}});
		menu.moveto = function(x,y){
			menu.x = x;
			menu.y = y;
		}
		menu.open = function(x,y){
			menu.hidden = false;
			x&&y&&menu.moveto(x,y);
			return this;
		}
		menu.close = function(empty){
			menu.hidden = true;
			if (empty)	menu.removeall();
			if (menu.exitonclose)
				menu.container.remove(menu);
		}
		return menu;
	}
	function BoardMenu(wl){
		var z = Trpg.Home.get("Gameplay.Board").camera.getzoom();
		var menu = new Trpg.Menu();
		menu.x = 400+(Trpg.board.cloc.dx(wl)*32-Trpg.board.cloc.mx+16)*z-menu.w/2;
		menu.y = 415+(Trpg.board.cloc.dy(wl)*32-Trpg.board.cloc.my)*z;
		menu.init=  function(){
			this.container.add({rl:-1,
			keydown:function(k){
				menu.close(true);
			},
			update:function(){
				menu.x = 400+(Trpg.board.cloc.dx(wl)*32-Trpg.board.cloc.mx+16)*z-menu.w/2;
				menu.y = 415+(Trpg.board.cloc.dy(wl)*32-Trpg.board.cloc.my)*z;
			},
			render:function(g){
				menu.adjwidths(g);
				menu.x = 400+(Trpg.board.cloc.dx(wl)*32-Trpg.board.cloc.mx+16)*z-menu.w/2;
				menu.y = 415+(Trpg.board.cloc.dy(wl)*32-Trpg.board.cloc.my)*z;
			}
		})}
		menu.close();
		Trpg.Home.add(menu,"Gameplay.");
		return menu;
	}
	function ToolBox(){
		var holder = new UI.DBox();
		holder.menu = new Trpg.Menu();
		holder.menu.close();
		holder.add(holder.menu,"menu");
		holder.add({
			rl:-1,//x:0,y:0,
			init:function(){
				this.tile = "empty";
				this.over = "board";
			},
			//keydown:function(k){holder.menu.close()},
				render:function(g){
					if (!exists(this.container.menu))	return;
					/*var before = "empty";
					var wlbefore = Trpg.board.aim.copy();
					if (this.over == "board"){ // } && this.tile !== "empty"){
						//console.log(this.tile);
						if (this.tile.getstate)	
							before = this.tile.getstate();
						if (this.tile.wl)
							wlbefore = this.tile.wl.copy();
					}*/
					var that = this;
					if (this.over == "map")	return this.tile = "empty";
					var before = (this.tile.getstate && this.tile.getstate())||"empty";
					
					if (this.over == "invent")
						this.tile = Trpg.invent.getaim();
					if (this.over == "board")
						this.tile = Trpg.board.getTile(Trpg.board.aim.copy());
					
					var changed = before == "empty" || before !== (this.tile.getstate && this.tile.getstate());
					
					if (this.tile == "empty")
						return holder.menu.removeall();
					
					if ((this.over == "board"&&(holder.menu.hidden))){
						holder.menu.removeall();
						var ents = Trpg.Entities.getents(Trpg.board.aim.copy());
						for (var i = 0; i < ents.length; i++)
							ents[i].fillmenu && ents[i].fillmenu(holder.menu);
						var items = Trpg.board.ground.getitems(this.tile.wl);
						for (var i = 0; i < items.length; i++)
							items[i].item && holder.menu.additem((function(a){return function(){
									Trpg.invent.pickupitem(a,that.tile.wl.copy());
									return "remove";
									//that.doaction(items[a]);
									//return "close";
								};})((function(b){return items[b].item})(i))
								//items[i].item)
								,"Pickup "+items[i].item.type,"orange");
						this.tile.fillmenu && this.tile.fillmenu(holder.menu);
					}
					else if (this.over == "invent")
						this.tile.fillmenu && this.tile.fillmenu(holder.menu);
					
					if (this.over == "invent" && Trpg.invent.withdrawing !== -1){
						this.withdrawing = true;
						holder.menu.removeall();
						//var that = this;
						var withdrawing = Trpg.invent.withdrawing;
						withdrawing.getwithdraw(this.tile,holder.menu);
						/*holder.menu.additem(function(){
							//var item = Trpg.invent.getaim();
							if (that.tile !== "empty")
								withdrawing.deposit(that.tile);
						},"Deposit","white");*/
					}
					if (this.withdrawing && this.over == "board"){
						Trpg.invent.withdrawing = -1;
						this.withdrawing = false;
					}
					/*
					if (this.over == "invent")
						this.tile = Trpg.invent.getaim();
					if (this.over == "board"){// && !holder.menu.hidden && Trpg.board.getTile(Trpg.board.aim.copy()).getstate() !== before)
						//Trpg.board.getTile(this.tile.wl.copy()).getstate())
						//this.tile = Trpg.board.getTile(this.tile.wl.copy());//*
				//	else if (this.container.menu.hidden && this.over == "board")
						before = (this.tile.getstate && this.tile.getstate())||"empty";
						//this.tile.getstate && before = this.tile.getstate();
						if (this.tile.wl)// && holder.menu.hidden)
							this.tile = Trpg.board.getTile(this.tile.wl);
						if (holder.menu.hidden || !exists(this.tile))
							this.tile = Trpg.board.getTile(Trpg.board.aim.copy());
						if (before !== this.tile.getstate())
							this.tile = Trpg.board.getTile(this.tile.wl.copy());
					}
					//if (this.tile == "empty")	return;// holder.menu.removeall();// console.log("E");
					//if ((this.over=="board"&&(this.tile.wl.dist(wlbefore)!==0||before!==this.tile.getstate()))||
					//	(this.over=="invent"))//&&(this.tile.wl.dist(wlbefore)!==0||before!==this.tile.type))||
					//if (before!== "empty"&&(this.tile.wl.dist(before)!==0)||(this.tile.type!==Trpg.board.getTile(before).type))
				if (this.tile.getstate && before !== this.tile.getstate())	{
					if (this.over == "invent")
						this.tile = Trpg.invent.getaim();
					else 
					this.tile = Trpg.board.getTile(this.tile.wl.copy());
				}
				if (this.tile == "empty")
					return holder.menu.removeall();
				if ((this.over == "board"&&(holder.menu.hidden||)) || this.over == "invent")
					this.tile.fillmenu && this.tile.fillmenu(holder.menu);
					/*if (false&&Trpg.invent.using !== -1){
						holder.menu.removeall();
						holder.menu.additem((function(t,u){return function(){
							u.useon(t);
						};})(this.tile,Trpg.invent.using),Trpg.invent.using.type+" -> "+this.tile.type);
					 } */
					if (!this.container.menu.hidden){
						//holder.menu.x = this.x;
						//holder.menu.y = this.y;
						this.container.menu.adjwidths(g);
					}
					if (holder.has("othermenu"))
						holder.get("othermenu").adjwidths(g);
					//if (this.container.menu.hidden)
						//this.tile.fillmenu(holder.menu);
						//this.container.setmenu(this.tile.getmenu());//.open(holder.x,holder.y));
					//this.container.menu.adjwidths(g);
					//this.menu.render(g);
					//if (this.menu.hidden && this.tile!=="empty" && exists(this.tile) && exists(this.tile.getActions) && exists(this.tile.getActions()[0]))
					
					var text = "";
					if (this.container.menu.has("item0") && holder.menu.hidden)
						text = this.container.menu.get("item0").text;
					g.font = "20px Arial";
					g.fillStyle = "white";
					g.globalAlpha = .5;
					var w = g.measureText(text).width;
					var h = g.measureText("M").width;
					if (text !== "")
						g.fillRect(holder.menu.x+15-w/2-5,holder.menu.y-h,w+10,h+10);
					g.globalAlpha = 1;
					g.fillStyle = "black";
					Drw.drawCText(g,text,holder.menu.x+15,holder.menu.y-5);
					return;
					/*
					if (this.tile == "empty")	return;
					var txt = this.tile.getActions()[0] || "";
					if (this.over == "invent" && K.Keys.shift.down && this.tile !== "empty") txt = "drop";
					g.font = "25px Arial";
					g.fillStyle = "black";
					Drw.drawCText(g,txt,holder.menu.x,holder.menu.y-20);*/
				},
				mousemove:function(e,m){
					//if (!exists(this.container.menu))	return;
					//if (!this.container.menu.mouseonbox(m))
					//	this.container.menu.close();
					//return;
					if (holder.menu.hidden){
						holder.menu.x = holder.boxx(m.x)-15;
						holder.menu.y = holder.boxy(m.y)-15;
					}
					if (Trpg.Home.get("Gameplay.Board").mouseonbox(m))
						this.over = "board";
					else if (Trpg.invent.container.mouseonbox(m))
						this.over = "invent";
					else this.tile = "empty";
					if (Trpg.Map.container.mouseonbox(m))
						//alert("fe34rgh")
						this.over = "map";
				},
				mousedown:function(e,m){
					
					if (!exists(this.container.menu))	return;
					//console.log(this.tile.getmenu());
					//if (this.container.menu.hidden)
					//	this.container.setmenu(this.tile.getmenu());
					if (e.button == 0){
						//if (Trpg.invent.using != -1){
							//console.log(Trpg.invent.using);
						//	Trpg.invent.using.useon(this.tile);
							//Trpg.invent.using = -1;
						//	return;
						// }
						//var tim = Trpg.Home.get("Gameplay.currentaction")
						if (this.container.menu.has("item0")){
						var first = this.container.menu.get("item0");
						
						first.onclick.call(first);
						}
						return;
						
						//if (K.Keys.shift.down && this.tile.getActions().indexOf("drop")!=-1)
						//	return this.tile.doaction("drop");
						
						if (Trpg.Home.get("Gameplay").has("currentaction")
								&&(Trpg.Home.get("Gameplay.currentaction").board==this.tile.board)
								&&(		(Trpg.Home.get("Gameplay.currentaction").board
										&&Trpg.Home.get("Gameplay.currentaction").wl.dist(this.tile.wl)==0)
									||	(!Trpg.Home.get("Gameplay.currentaction").board
										&&Trpg.Home.get("Gameplay.currentaction").space==this.tile.space)))
										return Trpg.Home.get("Gameplay").remove("currentaction");
						this.tile.doaction();
							//this.container.menu.get("item0").onclick.call
					} else if (e.button == 2){
						//if (!holder.menu.hidden)return;
//if (this.tile !== "empty")
					//		this.tile.fillmenu(holder.menu);
						//this.container.x = holder.menu.container.boxx(m.x);
						//this.container.y = holder.menu.container.boxy(m.y);
						holder.menu.open(holder.boxx(m.x)-15,holder.boxy(m.y)-15);
					//	this.x = holder.boxx(m.x)-15;
						//this.y = holder.boxy(m.y)-15;
						//(holder.x,holder.y);//holder.menu.container.boxx(m.x),holder.menu.container.boxx(m.y));
						//console.log(holder);
						//console.log(this.container.menu);
						//console.log(this.container.screeny(holder.menu.y));
					}
					
					//return;
					/*
					if (this.tile == "empty")return;
					if (e.button == 0){
						
						if (!this.menu.hidden)
							this.menu.mousedown(e,m);
						
						if (Trpg.invent.using != -1){
							//console.log(Trpg.invent.using);
							Trpg.invent.using.useon(this.tile);
							//Trpg.invent.using = -1;
							return;
						}
						
						if (this.tile.getActions && this.tile.getActions().length == 0)
							return;
						
						if (K.Keys.shift.down && this.tile.getActions().indexOf("drop")!=-1)
							return this.tile.doaction("drop");
						
						if (Trpg.Home.get("Gameplay").has("currentaction")
								&&(Trpg.Home.get("Gameplay.currentaction").board==this.tile.board)
								&&(		(Trpg.Home.get("Gameplay.currentaction").board
										&&Trpg.Home.get("Gameplay.currentaction").wl.dist(this.tile.wl)==0)
									||	(!Trpg.Home.get("Gameplay.currentaction").board
										&&Trpg.Home.get("Gameplay.currentaction").space==this.tile.space)))
										return Trpg.Home.get("Gameplay").remove("currentaction");
						this.tile.doaction();
					} else if (e.button == 2){
						//if (this.tile == "empty")	return;
						this.menu.open();
						this.menu.x = this.x-15;
						this.menu.y = this.y-15;
						this.updatemenu();
					}*/
				}
			/*makemenu()
					var that = this;
					that.menu = new BoardMenu(that.wl);
					//that.menu.onempty = function(){that.empty = true}
					var items = that.contents.items;
					that.menu.additem(function(){},"Chest","white");
					for (var i = 0; i < items.length; i++){
						that.menu.additem((function(a){return function(){
							if (Trpg.invent.getempty() == 0){
								that.menu.container.remove(that.menu);
								Trpg.board.container.add(new feedback("Not enough room",
								Trpg.board.cloc.dx(that.wl)*32+16+Trpg.board.container.camera.x,
								Trpg.board.cloc.dy(that.wl)*32+Trpg.board.container.camera.y,1.5),"feedback");
								return "close";
							}
							Trpg.invent.additem(a.copy().setinfinite(false));
							if (!a.infinite){
								items.splice(items.indexOf(a),1);
								return "remove";
							} else return "";
							return "remove";
						};})(items[i]),items[i].type,"orange");
					 }*/
		});
		return holder;
	}
/*/
		holder.add({
			x:0,y:0,
			tile:"empty",
			menu:new Trpg.Menu().sets({hidden:true}),
			init:function(){
				this.container.add(this.menu);
				this.container.add(new UI.Follow(this,Ms,function(x){return holder.boxx(x)},function(y){return holder.boxy(y)}));
				var that = this;
				this.container.add({
				mousemove:function(e,m){
					/*var c = this.menu;
					if (!this.menu.hidden && !c.mouseonbox(m)){
					//!c.inbounds(c.boxx(m.x),c.boxy(m.y))){
						this.menu.close(true);
					}*
					if (Trpg.Home.get("Gameplay.Board").mouseonbox(m))
						that.over = "board";
					else if (Trpg.invent.container.mouseonbox(m))
						that.over = "invent";
				},
				mousedown:function(e,m){
					if (that.tile == "empty")return;
					if (e.button == 0){
						
						if (!that.menu.hidden)
							that.menu.mousedown(e,m);
						
						if (Trpg.invent.using != -1){
							//console.log(Trpg.invent.using);
							Trpg.invent.using.useon(that.tile);
							//Trpg.invent.using = -1;
							return;
						}
						
						if (that.tile.getActions && that.tile.getActions().length == 0)
							return;
						
						if (K.Keys.shift.down && that.tile.getActions().indexOf("drop")!=-1)
							return that.tile.doaction("drop");
						
						if (Trpg.Home.get("Gameplay").has("currentaction")
								&&(Trpg.Home.get("Gameplay.currentaction").board==that.tile.board)
								&&(		(Trpg.Home.get("Gameplay.currentaction").board
										&&Trpg.Home.get("Gameplay.currentaction").wl.dist(that.tile.wl)==0)
									||	(!Trpg.Home.get("Gameplay.currentaction").board
										&&Trpg.Home.get("Gameplay.currentaction").space==that.tile.space)))
										return Trpg.Home.get("Gameplay").remove("currentaction");
						that.tile.doaction();
					} else if (e.button == 2){
						//if (this.tile == "empty")	return;
						that.menu.open();
						that.menu.x = that.x-15;
						that.menu.y = that.y-15;
						that.updatemenu();
					}
				}});
			},
			render:function(g){
				if (this.menu.hidden && this.over == "board")
					this.tile = Trpg.board.getTile(Trpg.board.aim.copy());
				//if (this.over == "board")// && this.tile.type !== Trpg.board.getTile(this.tile.wl.copy()).type)
				//	this.tile = Trpg.board.getTile(this.tile.wl.copy());
				if (this.over == "invent")
					this.tile = Trpg.invent.getaim();
				this.menu.adjwidths(g);
				//this.menu.render(g);
				//if (this.menu.hidden && this.tile!=="empty" && exists(this.tile) && exists(this.tile.getActions) && exists(this.tile.getActions()[0]))
				if (this.tile == "empty")	return;
				var txt = this.tile.getActions()[0] || "";
				if (this.over == "invent" && K.Keys.shift.down && this.tile !== "empty") txt = "drop";
				g.font = "25px Arial";
				g.fillStyle = "black";
				Drw.drawCText(g,txt,this.x,this.y-20);
			},
			updatemenu:function(){
				this.menu.removeall();
				var that = this;
				var actions = this.tile.getActions();
				for (var i = 0; i < actions.length; i++){
					that.a = actions[i];
					this.menu.additem((function(a){return (function(){that.tile.doaction(a);return"close";});})(actions[i]),actions[i]);
					//this.menu.get("item"+(this.menu.itemcount-1)).a = actions[i];
				}
				if (this.over == "invent" || this.tile == "empty")	return;
				
				var items = Trpg.board.ground.getitems(this.tile.wl);
				//console.log(items);
				if (!exists(items))
					return;
			//	console.log(items);
				for (var i = 0; i < items.length; i++){
					this.menu.additem((function(a){return (function(){Trpg.invent.additem(items.splice(items.indexOf(a),1)[0].item);
					return "remove"});})(items[i]),items[i].item.type,"orange");//(function(a){return items[a].item.type;})(i),"orange");
				}
			}
		},"rightclick");
		
		return holder;
		//{extra
		
		holder.add({
			//init:function(){
			//	this.btn = new UI.Button(this.container.boxx(Ms.x()),this.container.boxy(Ms.y()),0,35);
			// },
			//btn:new UI.Button(holder.boxx(Ms.x()),holder.boxy(Ms.y()),0,35),
			update:function(){
				if (!exists(this.btn))return;
				this.tile = Trpg.board.getTile(Trpg.board.aim.copy());
				var that = this;
				var action = this.tile && this.tile.getActions()[0];
				this.btn.sets({
					text:action || "",
					onclick:function(){
						that.tile.doaction(this.text);
					},
					hidden:!menu.hidden
				})
			},
			render:function(g){
				if (!exists(this.btn))return;
				this.btn.adjust(g);
				this.btn.render(g);
			},
			mousemove:function(e,m){
				if (!exists(this.btn))
					this.btn = new UI.Button(this.container.boxx(m.x),this.container.boxy(m.y),0,40).sets({ccolor:"clear",bcolor:"clear"});
				this.tile = Trpg.board.getTile(Trpg.board.aim.copy());
				this.btn.x = holder.boxx(m.x)-60;
				this.btn.y = holder.boxy(m.y)-35;
			}
		})
		
		
		
		
		return holder;
		holder.add(menu);
		holder.add(new UI.Button(0,0,0,35).sets({alphamod:1}),"leftclick")
		holder.add({
			rl:-1,
			btn:holder.get("leftclick"),
			mousemove:function(e,m){
				if (!Trpg.Home.get("Gameplay.Board").mouseonbox(m))	return;
				this.btn.x = holder.boxx(m.x)-15;
				this.btn.y = holder.boxy(m.y)-15;
				var wl = Trpg.board.aim.copy();
				
			},
			//mousedown:this.mousemove,
			render:function(g){
				this.btn.adjust(g);
				var tile = Trpg.board.getTile(Trpg.board.aim.copy());
				var actions = tile.getActions();
				this.btn.sets({
					text:actions && actions[0],
					onclick:function(){
						tile.doaction(this.text);
					},
					hidden:!menu.hidden
				})
				this.btn.adjust(g);
			}
		})
		holder.add({
			rl:-1,
			render:function(g){
				//if (!this.tile || this.tile.wl.dist(Trpg.board.getTile(Trpg.board.aim.copy())) == 0)
				//	return;
				menu.adjwidths(g);
				//this.container.remove(this)
				//this.tile = Trpg.board.getTile(Trpg.board.aim.copy());
		}});
		holder.add({
			rl:0,
			render:function(g){
				//if (!this.tile || this.tile.wl.dist(Trpg.board.getTile(Trpg.board.aim.copy())) == 0)
				//	return;
				menu.adjwidths(g);
				//this.tile = Trpg.board.getTile(Trpg.board.aim.copy());
			},
			update:function(){
				if (!this.tile || this.tile.getActions()!==Trpg.board.getTile(Trpg.board.aim.copy()).getActions())
					this.tile = Trpg.board.getTile(Trpg.board.aim.copy());
				if (menu.hidden) return;
				var actions = this.tile && this.tile.getActions() || [];
				menu.removeall();
				for (var i = 0; i < actions.length; i++){
					menu.additem(function(){
						this.tile.doaction(actions[i]);
						return "close,empty";
					},actions[i]);
				}
			},
			mousemove:function(e,m){
				if (!menu.mouseonbox(m))
					menu.close(true);
				//menu.moveto(menu.container.boxx(m.x)-15,menu.container.boxy(m.y)-15);
			},
			mousedown:function(e,m){
				if (e.button !== 2 || !menu.hidden || !Trpg.Home.get("Gameplay.Board").mouseonbox(m)){
					menu.hidden = true;
					return;
				}	//return true;
				this.tile = Trpg.board.getTile(Trpg.board.aim.copy());
				var actions = this.tile && this.tile.getActions() || [];
				
				for (var i = 0; i < actions.length; i++){
					menu.additem(function(){
						this.tile.doaction(actions[i]);
						return "close,empty";
					},actions[i]);
				}
				menu.moveto(menu.container.boxx(m.x)-15,menu.container.boxy(m.y)-15);
				holder.get("leftclick").hidden = true;
				menu.open();
			}
		})
		return holder;
		var box = new UI.DBox();
		//box.cropped = true;
		box.hidden = true;
		//box.curtool = "none";
		//box.tools = [];
		//box.color = "grey";
		//box.bcolor = "darkgrey";
		box.actingwl = -1;
		box.action = {
			timer:-1,
			loc:"none"
		}
		/*
		box.addTool = function(action, rmin, rmax){
			var pos = -1;
			for (var i = 0; i < box.tools.length; i++)
				if (box.tools[i].action == action)
					pos = i;
			if (pos == -1)box.tools.push({action:action,rmin:rmin,rmax:rmax});
			else box.tools.splice(pos,1,{action:action,rmin:rmin,rmax:rmax});
			box.reorg();
		}
		box.getTool = function(){
			for (var i = 0; i < this.tools.length; i++)
				if (this.tools[i].action == this.curtool)
					return this.tools[i];
		}
		box.inRange = function(d){
			var t = this.getTool();
			return d >= t.rmin && d <= t.rmax;
		}/*
		box.reorg = function(){
			var s = Math.ceil(Math.sqrt(box.tools.length));
			box.empty();
			box.w = s*50;
			box.h = Math.ceil(box.tools.length/s)*50;
			for (var i = 0; i < box.tools.length; i++){
				var btn = new UI.Button(i%s*50,Math.floor(i/s)*50,50,50);
				btn.toolname = box.tools[i].action;
				btn.inrender = function(g){
					g.fillStyle = "darkgrey";
					if (box.curtool == this.toolname)
						g.fillStyle = "black";
					g.font = "15px Arial";
					var a = this.toolname;
					Drw.drawCText(g,a.charAt(0).toUpperCase()+a.substring(1),this.w/2,this.h/2);
				}
				btn.onclick = function(){
					if (box.curtool == this.toolname)
						 box.curtool = "none";
					else box.curtool = this.toolname;
					box.invisible = true;
				}
				box.add(btn);
			}
		} *
		box.moveToMouse = function(m){
		//	console.log(box.x);
		
			box.x = box.container.boxx(m.x)-10;
			box.y = box.container.boxy(m.y)-10;
			return;
			///box.x = m.relx(box.container)/box.container.cumZoom()-20;
			//box.y = m.rely(box.container)/box.container.cumZoom()-15;
			var mx = m.x,
				h = Trpg.Home,
				bx = h.boxx(m.x),
				zoom = h.camera.getzoom(),
				sx = h.screenx(bx),
				div = bx/mx;
				
				/*
				hx 0 
				mx 300
				hz 1.5
				c
				*
				
				
			console.log(mx);
			console.log(bx);
			console.log(h.screenx(bx));
			//console.log((sx-mx));
			//console.log(h.screenx(mx*zoom));//h.boxx(mx)));
			//console.log(sx-h.camera.relx(h.camera.x));
			//console.log(zoom);
			//console.log(div);
			console.log("-----");
			
			//var sx = h.screenx();
			//console.log(cum);
			//console.log((mx-sx)/zoom);
			//console.log("=====");
		}
		//box.open = function(wl){
			//console.log(tile.getActions());
		//			box.actingwl = wl.copy();
		//	var tile = Trpg.board.getTile(wl);
		box.open = function(tile){
			var actions = tile.getActions();
			if (Trpg.invent.using != -1)
				actions = [Trpg.invent.using.type+" -> "+tile.type];
			//var wl = tile.wl;
			//if (!isinv)
			//	box.actingwl = wl.copy();
			var s = actions.length;//Math.ceil(Math.sqrt(actions.length));
			//if (s == 0)	return;
			box.empty();
				var btn = new UI.Button(0,0,135,35);
				btn.text = tile.type;
				btn.onclick = function(){
					box.empty();
					box.hidden = true;
				}
				box.add(btn);//actions[i].charAt(0).toUpperCase()+actions[i].substring(1);
			box.h = s*35+35;
			box.w = 135;//Math.ceil(actions.length/s)*50;
		//	console.log(box.w+" "+box.h);
			for (var i = 0; i < actions.length; i++){
				var btn = new UI.Button(0,i*35+35,135,35);//Math.floor(i/s)*75,i%s*25,75,25);
				btn.toolname = actions[i];
				btn.text = actions[i].charAt(0).toUpperCase()+actions[i].substring(1);
				/*btn.inrender = function(g){
					//g.fillStyle = "darkgrey";
					//if (box.curtool == this.toolname)
						g.fillStyle = "black";
					g.font = "15px Arial";
					var a = this.toolname;
					Drw.drawCText(g,a.charAt(0).toUpperCase()+a.substring(1),this.w/2,this.h/2);
				}*
				btn.onclick = function(){
					if (this.toolname.indexOf("->")!=-1)
						Trpg.invent.using.useon(tile);
					else if (this.toolname != "")
						tile.doaction(this.toolname);
					box.empty();
					box.hidden = true;
					return true;
				}
				box.add(btn);
			}
			if (exists(tile.wl) && Trpg.board.ground.hasitems(tile.wl)){
				var items = Trpg.board.ground.getitems(tile.wl);
				if (items.length > 1){
					var btn = new UI.Button(0,box.h,135,35);
					box.h+=35;
					btn.color = "orange";
					btn.text = "Take All";
					btn.onclick = function(){
						var es = Trpg.invent.getempty();
						var l = items.length;
						for (var i = 0; i < es && i < l; i++)
							Trpg.invent.additem(items.splice(0,1)[0].item);
						box.empty();
						box.hidden = true;
						return true;
					}
					box.add(btn);
				}
				for (var i = 0; i < items.length; i++){
					var btn = new UI.Button(0,box.h+35*i,135,35);
					btn.color = "orange";
					btn.text = items[i].item.type;
					btn.i = i;
					btn.item = items[i];
					btn.onclick = function(){
						Trpg.invent.additem(this.item.item);
						items.splice(items.indexOf(this.item),1);
						//Trpg.invent.additem(items.splice(this.i,1)[0].item);
						box.remove(this);
						box.h-=35;
						if (items.length == 0){
							box.empty();
							box.hidden = true;
						} else {
							var q = box.getq();
							for (var p in q){
								if (exists(q[p].systemname) && 
									q[p].systemname.indexOf("item")!==-1 && 
									parseInt(q[p].systemname.substring(4)) >= this.i){
										q[p].y-=35;
								}
							}
						}
						return true;
					}
					box.add(btn,"item"+i);
				}
				box.h+=35*items.length;
			}
			box.container.add({
				rl:-1,
				render:function(g){
					var maxwidth = 0;
					var q = box.getq();
					for (var i = 0; i < q.length; i++){
						q[i].adjust && q[i].adjust(g);
						if (q[i].w>maxwidth)
							maxwidth = q[i].w;
					}
					for (var i = 0; i < q.length; i++)
							q[i].w = maxwidth;
					var c = box;
					var cc= Trpg.Home;
					var b = cc.getbounds();
					c.w = maxwidth;
					while (cc.boxx(c.screenx(c.w))>cc.w&&cc.boxx(c.screenx(c.w))>0)	c.x--;
					while (cc.boxy(c.screeny(c.h))>cc.h&&cc.boxy(c.screeny(c.h))>0)	c.y--;
					while (cc.boxx(c.screenx(c.w))<0)	c.x++;
					while (cc.boxy(c.screeny(c.h))<0)	c.y++;
					//while(!Trpg.Home.inbounds(0,
					//	this.container.container.screeny(this.container.y+this.container.h)))
					//		this.container.y--;
					//this.container.camera.reset();
					//this.container.x+=maxwidth-135;
					this.container.remove(this);
				}
			})
			if (box.h > 0)
			box.hidden = false;
		}
		box.clicked = function(tile){
			//console.log(box.actingwl);
			//if (box.container.has("actiondelay")//&&exists(box.actingwl)
			//	&&(exists(box.actingwl)
			//&&box.actingwl !== -1
			//&&wl.dist(box.actingwl)==0){
			//	box.container.remove("actiondelay");
			//	box.actingwl = -1;
			//	return;
			// }
			//var tile = Trpg.board.getTile(wl);
			if (Trpg.invent.using != -1){
				Trpg.invent.using.useon(tile);
				Trpg.invent.using = -1;
				return;
			}
			//console.log("not using");
			if (tile.getActions().length == 0)
				return;
			if (K.Keys.shift.down && tile.getActions().indexOf("drop")!=-1)
				return tile.doaction("drop");
			//console.log("not using2");
			if (Trpg.Home.get("Gameplay").has("currentaction")
					&&(Trpg.Home.get("Gameplay.currentaction").board==tile.board)
					&&(		(Trpg.Home.get("Gameplay.currentaction").board
							&&Trpg.Home.get("Gameplay.currentaction").wl.dist(tile.wl)==0)
						||	(!Trpg.Home.get("Gameplay.currentaction").board
							&&Trpg.Home.get("Gameplay.currentaction").space==tile.space)))
							return Trpg.Home.get("Gameplay").remove("currentaction");
			//console.log("not using3");
			//console.log(tile);
			tile.doaction();
			//console.log(Trpg.invent.using);
			return;
			
			
			//box.actingwl = wl.copy();
			//box.empty();
			//box.hidden = true;
			//var timer = new Utils.Timer(tile.getDelay()*.2*(2+wl.dist(Trpg.board.cloc))).start().setAuto(true, 
			//	function(){tile.doaction();box.actingwl = -1}).setKilloncomp(true);
			//if (box.container.has("actiondelay"))
			//	box.container.remove("actiondelay");
			//box.container.add(timer,"actiondelay");
		}
		box.init = function(){
			/*this.container.add(new Utils.MouseListener("down",function(e,m){
				if (e.button == 2 && box.invisible){
					box.invisible = false;
					box.x = m.relx(box.container)/box.container.cumZoom()-25;//-box.w/2;
					box.y = m.rely(box.container)/box.container.cumZoom()-25;//-box.h/2;
				}
			}));*
			this.container.add(new Utils.MouseListener("move",function(e,m){
			//	var bbox = new UI.DBox(box.x-box.w/8,box.y-box.h/8,box.w*(1+1/4),box.h*(1+1/4));
				//box.container.add(bbox);
				if (!box.mouseonbox(m)){//bbox
				box.hidden = true;}
				//box.container.remove(bbox);
			}));
		}
		Trpg.Home.get("Gameplay.Menus").add(new (function(){
			this.mousedown = function(e,m){
				if (!Trpg.Home.mouseonbox(m))	return;
				if (Trpg.Home.get("Gameplay.Board").mouseonbox(m)){
					box.moveToMouse(m);
					if (e.button == 2){
						box.open(Trpg.board.getTile(Trpg.board.aim.copy()));
						return;
					}
					if (box.hidden)
					//console.log(Trpg.board.aim.copy());
					box.clicked(Trpg.board.getTile(Trpg.board.aim.copy()));
				}
				else if (Trpg.Home.get("Gameplay.Invent").mouseonbox(m)){
					box.moveToMouse(m);
					if (e.button == 2){
						var s = Trpg.invent.getspace(m);
						if (s!==-1&&Trpg.invent.getitem(s)!=="empty")
							box.open(Trpg.invent.getitem(s));
						return;
					}
					if (box.hidden){
						var s = Trpg.invent.getspace(m);
						if (s!==-1&&Trpg.invent.getitem(s)!=="empty")
							box.clicked(Trpg.invent.getitem(s));
					}
					//console.log(Trpg.board.aim.copy());
					//box.clicked(Trpg.board.getTile(Trpg.board.aim.copy()));
				}
				//Trpg.invent.using = -1;
			}
		})(),"toolclicker");
		return box;//}
	}*/
	this.Board = function(){
		this.load = function(wl,force){
			if (!exists(wl)) wl = new Trpg.WorldLoc(0,0,3,3);
			this.rcenter = new Trpg.WorldLoc(wl.wx,wl.wy,3,3,wl.dim);
			this.lcenter = new Trpg.WorldLoc(wl.wx,wl.wy,4,4,wl.dim);
			var ccenter = new Trpg.WorldLoc(wl.wx,wl.wy,0,0,wl.dim);
			if (force)
				this.loaded = [];
			for (var i = -1; i <= 1; i++)
				for (var j = -1; j <= 1; j++){
					var alreadyin = false;
					for (var k = 0; k < this.loaded.length; k++)
						if (this.loaded[k].wl.dist(new Trpg.WorldLoc(wl.wx+i,wl.wy+j,0,0,wl.dim)) == 0)
							alreadyin = true;
					if (alreadyin)
						continue;
					var newchunk = new Trpg.Chunk(wl.wx+i,wl.wy+j,wl.dim).generate();
					this.loaded.push(newchunk);
					Trpg.Structures.checkchunk(newchunk.wl);
					newchunk.loadChanges();
					//if (Trpg.Structures.hasstruct(newchunk.wl))
					//	Trpg.Structures.fillchunk(newchunk.wl);
				}
			for (var k = 0; k < this.loaded.length; k++)
				if (this.loaded[k].wl.dist(ccenter) > 8){
					var changes = this.loaded[k].getChanges();
					if (changes!="none"){
						Trpg.world.changes[this.loaded[k].code] = changes;
					}
					this.loaded.splice(k,1);
					k--;
				}
			//Trpg.Structures.checkcenters(wl);
		}
		this.save = function(){
			for (var k = 0; k < this.loaded.length; k++){
				var changes = this.loaded[k].getChanges();
				if (changes!="none")
					Trpg.world.changes[this.loaded[k].code] = changes;
			}
		}
		this.ground = new (function(){
			function grounditem(item){
				return {
					item:item,
					x:Math.random()*32,
					y:Math.random()*32
				}
			}
			this.getitems = function(wl){
				return this.items[wl.toStr()] || [];
			}
			this.items = {}
			this.hasitems = function(wl){
				return this.items.hasOwnProperty(wl.toStr()) && this.items[wl.toStr()].length > 0;
			}
			this.render = function(g,wl){
				var l = this.items[wl.toStr()];
				g.save();
				g.scale(1/2,1/2);
				for (var i = 0; i < l.length; i++)
					l[i].item.render(g,l[i].x,l[i].y);
				g.restore();
			}
			this.dropitem = function(item, wl){
				var i = grounditem(item);
				if (!this.hasitems(wl))
					this.items[wl.toStr()] = [i];
				else 
					this.items[wl.toStr()].push(i);
				var list = this.items[wl.toStr()];
				Trpg.board.container.add(new Utils.Timer(30).start().setAuto(true,function(){
							list.splice(list.indexOf(i),1);
						}).setKilloncomp(true));
			}
		})()
		this.getTile = function(wl){
			for (var i = 0; i < this.loaded.length; i++)
				if (this.loaded[i].wl.chunkdist(wl)==0)
					return this.loaded[i].getTile(wl);
			return new Trpg.Chunk(wl.wx,wl.wy,wl.dim).generate().getTile(wl);
		}
		this.setTile = function(tile, wl){
			for (var i = 0; i < this.loaded.length; i++)
				if (this.loaded[i].wl.chunkdist(wl)==0)
					this.loaded[i].setTile(tile,wl.copy());
		}
		this.init = function(){
			//console.log("initing");
			this.loaded = [];
			Trpg.Home.add(Trpg.toolbox = new ToolBox(),"Gameplay.Menus.");
			Trpg.Structures.init();
			Trpg.bank = {contents:{items:[]}}
			this.playertarget = -1;
			this.attackdelay = new Utils.Timer(1).start(true);
			this.attrange = 2;
			this.maxhp = this.hp = 10;
			Trpg.Entities.entities.push(new Trpg.Entities.Entity("Cow",new Trpg.WorldLoc(-1,1,3,0)));
			//this.hp--;
			//this.player = new Player();
			//this.mx = this.my = 16;
			this.cloc = new Trpg.WorldLoc(-1,1,3,3,"surface",16,16);
			var that = this;
			this.cloc.onmove = function(wl){
				that.getTile(wl).doaction("walkon");
				if (!that.getTile(wl).traits.walkable)
					return false;
				//that.getTile(wl).doaction("walkon");
				if (Trpg.Home.get("Gameplay").has("currentaction"))
					Trpg.Home.get("Gameplay").remove("currentaction");
				if (wl.cx<1||wl.cx>6||wl.cy<1||wl.cy>6)
					that.load(wl);
				return true;
			}
			this.aim = this.cloc.copy();
			this.running = false;
			this.forcing = true;
			this.runenergy = 100;
			//this.cloc.dim = "underground1";
			this.load(this.cloc,true);
			//this.setTile(new Trpg.Tile("Chest"),new Trpg.WorldLoc(-1,1,5,5))
			//this.setTile(new Trpg.Tile("StoneFloor").setWl(this.cloc),this.cloc);
			while (!this.getTile(this.cloc).getTrait("walkable")){
				this.cloc.cx+=Math.floor(Math.random()*2-1);
				this.cloc.cy+=Math.floor(Math.random()*2-1);
				this.cloc.legalize();
			//	console.log(this.cloc.toStr());
			//console.log(this.getTile(this.cloc).getTrait("walkable"));
			}
			//this.player.firstloc = this.cloc.copy();
			//console.log(this.getTile(this.cloc).getTrait("walkable"));
			//this.load(this.cloc);
			
			this.dx = 0;
			this.dy = 0;
			//this.center.container = this.container;
			this.viewsize = 9;
			this.container.camera.zoomto(1/(this.viewsize-1)/64*this.container.w);
			this.container.add(new UI.Follow(this.container.camera,this.cloc,0,0,32));
		}
		this.keydown = function(k){
			switch (k.code){
				case "Space":
					this.running = !this.running;
					break;
				//case "ControlLeft":
				//	this.forcing = !this.forcing;
				//	break;
			}
			//if (k.name != "esc")	return;
			//console.log(Trpg.world.getChanges());
			//return false;
		 }
		/*this.mousedown = function(e,m){
			if (this.aim == -1 || (e.button != 0 && e.button !=2))
				return;
			Trpg.toolbox.moveToMouse(m);
			if (e.button == 2){
				Trpg.toolbox.open((this.aim.copy()));
				return;
			}
			Trpg.toolbox.clicked(this.aim.copy());
		}
			
			if (Trpg.toolbox.getTool().action == "kill")
				for (var i = 0; i < Board.get("Birds").getq().length; i++){
					var bird = Board.get("Birds").getq()[i];
					if (bird.wl.dist(this.aim) == 0){
						bird.kill();
						i--;
					}
				}
			else this.getTile(this.aim).doaction(Trpg.toolbox.getTool().action);
		}/*
		this.keydown = function(k){
			//this.dx = 0;
			//this.dy = 0;
			switch (k.name){
				case "W":case "A":case "S":case "D":
					if (this.d.indexOf(k.name)==-1)
						this.d.splice(0,0,k.name);
						//this.d = k.name+this.d;
					break;
				case "Q":
					
					break;
				/*case "W":	this.dy = -1;	break;
				case "A":	this.dx = -1;	break;
				case "S":	this.dy = 1;	break;
				case "D":	this.dx = 1;	break;*
			}
		}
		this.keyup = function(k){
			switch (k.name){
				case "W":case "A":case "S":case "D":
					if (this.d.indexOf(k.name)!=-1)
						this.d.splice(this.d.indexOf(k.name),1);
					break;
			}
		}*/
		this.mousemove = function(e,m){
			this.onboard = this.container.mouseonbox(m);
			if (!this.onboard)	return;
			var fakecam = {x:this.container.camera.x,y:this.container.camera.y,container:this.container};
			//var fakecam = {x:this.center.x()+this.center.mx,y:this.center.y+this.center.my,container:this.container};
			//g.rotate(Ms.rela(fakecam));
			
			var x = m.relx(fakecam)/this.container.cumZoom()+this.cloc.mx-16;
			var y = m.rely(fakecam)/this.container.cumZoom()+this.cloc.my-16;
			/*if (x > 64)		x = 64;
			if (x < -64)	x = -64;
			if (y > 64)		y = 64;
			if (y < -64)	y = -64;
			*///if (Ms.reld(fakecam) >= 64*this.container.cumZoom()) {
			//	x = 64*Math.cos(Ms.rela(fakecam));
			//	y = 64*Math.sin(Ms.rela(fakecam));
			// }
			this.aim = this.cloc.copy();
			this.aim.cx+=Math.round(x/32);
			this.aim.cy+=Math.round(y/32);
			this.aim.mx = (x+16).mod(32);
			this.aim.my = (y+16).mod(32);
			
			this.aim.legalize();
			
			if (//Trpg.toolbox.curtool == "none" || 
				!this.container.mouseonbox(m))//  ||
				//this.aim.dist(this.cloc) > 2)
				//!Trpg.toolbox.inRange(this.aim.dist(this.cloc)))
					//this.aim = -1;
					return;
			/*
			if (Trpg.toolbox.curtool == "none" || 
				!this.container.mouseonbox(Ms.getMouse()) ){// ||
				//!Trpg.toolbox.inRange(this.aim.dist(this.cloc)))
				this.aim = -1;return;}
			var temp = this.cloc.copy();
			var valid = false;
			var a = Math.atan2(y,x);
			for (var i = 0; i < Math.sqrt(x*x+y*y); i++){
				var valid = Trpg.toolbox.inRange(temp.dist(this.cloc));
				if (valid)	this.aim = temp.copy();
				temp.cx+=Math.round(i*Math.cos(a));
				temp.cy+=Math.round(i*Math.sin(a));
				temp.legalize();
				if (valid && !Trpg.toolbox.inRange(temp.dist(this.cloc)))
					break;
				
			}
			return;
			
			this.aim = this.cloc.copy();
			this.aim.cx+=Math.round(x/32);
			this.aim.cy+=Math.round(y/32);
			this.aim.legalize();
			
			if (Trpg.toolbox.curtool == "none" || 
				!this.container.mouseonbox(Ms.getMouse()) )// ||
				//!Trpg.toolbox.inRange(this.aim.dist(this.cloc)))
					this.aim = -1;
			if (this.aim!=-1 && !Trpg.toolbox.inRange(this.aim.dist(this.cloc))){
				var d = this.aim.dist(this.cloc);
				var ddist = (function(){
					for (var i = 0; i < d; i++)
						if (Trpg.toolbox.inRange(d-i))
							return -1;
						else if (Trpg.toolbox.inRange(d+i))
							return 1;
						return 0;
				})();
				if (ddist == 0){
					this.aim = -1;
					return;
				}
				var start = this.aim.copy();
				var a = Math.atan2(this.cloc.dy(this.aim),this.cloc.dx(this.aim));
				var dd = Math.sqrt(32*32*(this.cloc.dy(this.aim)*this.cloc.dy(this.aim)+this.cloc.dx(this.aim)*this.cloc.dx(this.aim)));
				
				do {
					//start.cx+=Math.cos(a)*ddist;
					//start.cy+=Math.sin(a)*ddist;
					
					//start.legalize();
					
					this.aim.cx+=Math.floor(Math.floor(dd*Math.cos(a))%32/32)*ddist;
					this.aim.cy+=Math.floor(Math.floor(dd*Math.sin(a))%32/32)*ddist;
					this.aim.legalize();
					alert(this.aim.toStr()+" "+this.cloc.dist(this.aim));
					dd--;
					
					//var x = this.cloc.dx(this.aim);
					//var y = this.cloc.dy(this.aim);
					
					//if (Math.abs(x) > Math.abs(y)){
					//	this.aim.cx+=ddist;
					// }
					
					
					//Math.sign(this.cloc.dx(this.aim))*ddist;
					//start.cy+=Math.sign(this.cloc.dy(this.aim))*ddist;
					//this.aim.cx = Math.round(start.cx);//+=Math.sign(this.cloc.dx(this.aim))*ddist;
					//this.aim.cy = Math.round(start.cy);//+=Math.sign(this.cloc.dy(this.aim))*ddist;
					//b--;
				} while (!Trpg.toolbox.inRange(this.aim.dist(this.cloc))&&dd>0);
				//if (b <= 0)
				//	this.aim = -1;
			} */
		}
		this.update = function(dlt){
			//this.cd.update(dlt);
			for (var i = 0; i < this.loaded.length; i++)
				this.loaded[i].update(dlt);
			this.dx = 0;
			this.dy = 0;
			
			if (K.Keys.W.down || K.Keys.up.down)	this.dy--;
			if (K.Keys.A.down || K.Keys.left.down)	this.dx--;
			if (K.Keys.S.down || K.Keys.down.down)	this.dy++;
			if (K.Keys.D.down || K.Keys.right.down)	this.dx++;
			
			var speed = 170*dlt;
			this.cloc.move(this.dx*speed,this.dy*speed);
			this.mousemove("blah",Ms.getMouse());
			
			this.attackdelay.update(dlt);
			
			if (this.playertarget !== -1){
				var t = this.playertarget;
				if (t.loc.dist(this.cloc) <= this.attrange){
					if (this.attackdelay.consume()){
						t.damage(1);
						this.attackdelay.start();
					}
						
				}
			}
			
			Trpg.Entities.update(dlt);
			/*//if (this.d = [])
			//	return;
			//var dr = this.d[0];//this.mq;
			//if ("WASD".indexOf(this.mq)!=-1&&this.mq!="")
			//	dr = this.mq;
			//if (this.d.length == 0 && "WASD".indexOf(this.mq)!=-1)
			//	dr = this.mq;
			//if (this.mq!="")
			//	dr = this.mq;
			//else if (!this.cd.ready()&&this.mq =="" && this.d.length>0){
			//	this.mq = dr;
			// }
			//if (this.mq != "")
				//dr = this.mq;
			//this.mq = "";
			//if ("WASD".indexOf(dr)==-1 && this.d!=[])
			//	dr = this.d[0];
		//if (this.cd.ready())
		///	dr = this.mq;
			//if ("WASD".indexOf(this.mq)!=-1 && this.mq != "")
			//	dr = this.mq;
				
				/*
			switch (dr){
				case "W":	this.dy = -1;	break;
				case "A":	this.dx = -1;	break;
				case "S":	this.dy = 1;	break;
				case "D":	this.dx = 1;	break;
			} *
			/*var speed = 100*dlt;
			if (this.running && this.runenergy > 0 && (this.dx!=0||this.dy!=0)){
				speed*=2;
				this.runenergy-=3*dlt;
			}
			if (this.runenergy <= 0)
				this.running = false;
			
			if ((!this.running || (this.dx==0&&this.dy==0)) && this.runenergy<100)
				this.runenergy+=1*dlt;
			*
			//if (this.dx!=0&&this.dy!=0)
			//	speed/=Math.sqrt(2);
			//this.cloc.move(this.dx*speed);
			
			
			
			/*this.cloc.mx+=this.dx*speed;
			this.cloc.my+=this.dy*speed;
			var loc = this.cloc.copy();
			if (this.cloc.mx < 0 || this.cloc.mx >= 32){
				loc.cx+=this.dx;
				//this.cloc.cx+=this.dx;
				loc.legalize();
				//this.cloc.legalize();
				if (this.forcing)
					this.getTile(loc).doaction("walkon");
				if (!this.getTile(loc).getTrait("walkable")){
				//if (!this.getTile(this.cloc).getTrait("walkable")){
					loc.cx-=this.dx;
					//this.cloc.cx-=this.dx;
					this.cloc.mx-=this.dx*speed;
				} else {
					this.cloc.mx-=32*this.dx;
				}
			}
			if (this.cloc.my < 0 || this.cloc.my >= 32){
				loc.cy+=this.dy;
				//this.cloc.cy+=this.dy;
				loc.legalize();
				//this.cloc.legalize();
				if (this.forcing)
					this.getTile(loc).doaction("walkon");
				if (!this.getTile(loc).getTrait("walkable")){
				//if (!this.getTile(this.cloc).getTrait("walkable")){
					loc.cy-=this.dy;
					//this.cloc.cy-=this.dy;
					this.cloc.my-=this.dy*speed;
				} else {
					this.cloc.my-=32*this.dy;
				}
			}
			loc.legalize();
			if (this.cloc.dist(loc)!=0){
				this.getTile(loc).doaction("walkon");
				if (Trpg.Home.get("Gameplay").has("currentaction"))
					Trpg.Home.get("Gameplay").remove("currentaction");
			}
			this.cloc.load(loc);
			//this.cloc.wx = loc.wx;
			//this.cloc.wy = loc.wy;
			//this.cloc.cx = loc.cx;
			//this.cloc.cy = loc.cy;
			if (this.rcenter.dist(this.cloc)>4||this.lcenter.dist(this.cloc)>4)
				this.load(this.cloc);
			this.mousemove("blah",Ms.getMouse());
			//while(!this.player.inRange(this.aim)){
				
			// }
				
		//	if (("WASD".indexOf(this.mq)==-1 || this.mq == "") && this.dx==this.mx&&this.dy==this.my)
			//	this.mq = dr;
			
		//	if (!this.cd.ready())
			//	if (this.dx == this.mx && this.dy == this.my)
			//		;//ignore it
			//	else this.mq = dr;
			/*
			if (this.dx != 0 || this.dy != 0)
				if (this.cd.ready()){		
					this.center.cy+=this.dy;
					this.center.cx+=this.dx;
					this.mx = this.dx;
					this.my = this.dy;
					this.center.legalize();
					this.cd.consume();
					this.mq = "";
				} //else if (this.d.length > 1)
					//this.mq = this.d[1];
				*/
		}
		this.render = function(g){
			//g.translate(-32*this.center.cx,-32*this.center.cy);
			//if (!this.cd.ready())
				g.save();
				g.translate(-this.cloc.mx,-this.cloc.my);
				//g.translate(32*this.mx*(1-this.cd.progress()),32*this.my*(1-this.cd.progress()));
			for (var i = 0; i < this.loaded.length; i++){
				g.save();
				this.loaded[i].render(g);
				g.restore();
			}
			g.restore();
				//g.fillStyle = "white";
				//g.fillRect(this.container.camera.x-2,this.container.camera.y-2,4,4);
				g.save();
				g.translate(this.container.camera.x-16,this.container.camera.y-16)
				g.drawImage(Ast.i("playerS"),0,0);
				if (this.attackdelay.progress() < .2
					&& this.playertarget !== -1 
					&& this.playertarget.loc.mdist(this.cloc) < this.attrange
					&& this.playertarget.hp > 0){
					g.save();
					var t = this.playertarget;
					g.translate(16,16);
					g.rotate(Math.atan2(this.cloc.mdy(t.loc),this.cloc.mdx(t.loc)));
					g.strokeStyle = "white";
					g.fillRect(0,-2,this.playertarget.loc.mdist(this.cloc)*32,6);
					g.fillStyle = "black";
					g.strokeRect(0,-2,this.playertarget.loc.mdist(this.cloc)*32,6);
					
					g.restore();
				}
				if (this.hp < this.maxhp){
					var m = 20*this.hp/this.maxhp;
					g.fillStyle = "green";
					g.fillRect(6,-8,m,5)
					g.fillStyle = "red";
					g.fillRect(6+m,-8,20-m,5);
				}
				Trpg.Entities.render(g);
				g.restore();
				g.save();
				g.fillStyle = "black";
				g.font = "10px Arial";
				g.globalAlpha = .25;
				g.fillText(this.cloc.toStr(),this.container.getbounds().l+2,this.container.getbounds().u+10);
				//g.translate(this.container.camera.x,this.container.camera.y-6);//dont draw aimer
				//else g.fillRect(0,-2,Math.sqrt(x*x+y*y),4);
				//else if (Ms.reld(fakecam) < 64*this.container.cumZoom())
				//	 g.fillRect(0,-2,Ms.reld(fakecam)/this.container.cumZoom(),4);
				//else //if (Ms.reld(fakecam) < 2*64*this.container.cumZoom())
				//	g.fillRect(0,-2,64,4);
				g.restore();
				//g.fillText(this.d,100,100);
			//	g.fillText(this.mq,100,150);
			//	g.fillStyle = "black";
			
		}
	}
	function Astar(start, end, range){
		if (!Trpg.board.getTile(end).traits.walkable)
			return "failed";
		function Spot(wl,parent,gcost,hcost,dir){
			this.wl = wl.copy();
			this.parent = parent;
			this.gcost = (parent.gcost || 0) + gcost;
			this.hcost = hcost;
			this.fcost = this.gcost+this.hcost;
			this.dir = dir;
		}
		function manH(s,e){
			return 10*(Math.abs(s.dx(e))+Math.abs(s.dy(e)));
		}
		function getadj(spot){
			/*var dirs = [
			{x:0,y:-1,d:"n"},
			{x:1,y:0,d:"e"},
			{x:0,y:1,d:"s"},
			{x:-1,y:0,d:"w"},
			];*/
			var dirs = [
			{x:0,y:-1},
			{x:1,y:0},
			{x:0,y:1},
			{x:-1,y:0},
			];
			var adjs = [];
			for (var i = 0; i < dirs.length; i++){
				var wl = spot.wl.copy().shift(dirs[i].x,dirs[i].y);
				if (Trpg.board.getTile(wl).traits.walkable)
					if (cstrs.indexOf(wl.toStr()) == -1)
						adjs.push(new Spot(wl,spot,10,manH(wl,end),dirs[i]));
			}
			return adjs;
		}
		function picklowf(open){
			var ele = open[0]
			for (var i = 0; i < open.length; i++)
				if (open[i].fcost < ele.fcost)
					ele = open[i];
			return ele;
		}
		function makepath(spot){
			if (spot.parent == -1)
				return [];
			var p = makepath(spot.parent);
			p.push(spot.dir);
			return p;
			//return makepath(spot.parent)+spot.dir;
		}
		var openlist = [new Spot(start,-1,0,manH(start,end))];
		var closedlist = [];
		var ostrs = [start.toStr()];
		var cstrs = [];
		while (openlist.length > 0){
			var lowf = picklowf(openlist);
			openlist.splice(openlist.indexOf(lowf),1);
			ostrs.splice(ostrs.indexOf(lowf.wl.toStr()));
			closedlist.push(lowf);
			cstrs.push(lowf.wl.toStr());
			if (lowf.wl.dist(start) > range || lowf.wl.dist(Trpg.board.cloc)>Trpg.board.viewsize)
				return "failed";
			if (lowf.wl.dist(end)==0)
				return makepath(lowf);
			var adjs = getadj(lowf);
			for (var j = 0; j < adjs.length; j++){
				if (ostrs.indexOf(adjs[j].wl.toStr())!==-1)
					for (var k = 0; k < openlist.length; k++)
						if (openlist[k].wl.dist(adjs[j].wl)==0 && openlist[k].gcost > adjs[j].gcost){
							openlist[k] = adjs[j];
							continue;
						}
				openlist.push(adjs[j]);
			}
		}
		return "failed";
	}
	this.Entities = new (function(){
		this.Entity = function(type,wl){
			function Default(wl){
				this.cb = 0;
				this.maxhp = this.hp = 0;
				this.spawn = wl.copy();
				this.loc = wl.copy();
				this.loc.mx = this.loc.my = 16;
				this.actions = ["examine"];
				this.speed = 50;
				this.attackdelay = new Utils.Timer(1).start(true);
				this.attrange = Trpg.board.attrange;
				this.loc.onmove = function(wl){
					return (Trpg.board.getTile(wl).traits.walkable);
				}
				var that = this;
				this.damage = function(amt){
					this.hp-=amt;
					this.changestate("playeragro");
					if (this.hp <= 0){
						this.respawntimer.start();
						if (Trpg.board.playertarget==this)
							Trpg.board.playertarget = -1;
					}
				}
				this.respawntimer = new Utils.Timer(5).setAuto(true,function(){
					that.hp = that.maxhp;
					that.loc.load(that.spawn);
					that.changestate("wander");
				});
				this.saying = "";
				this.saytimer = new Utils.Timer(2).setAuto(true,function(){that.saying = ""});
				Trpg.board.container.add(this.saytimer);
				this.targ = wl.copy();
				//this.mx = this.my = 16;
				this.range = 5;
				this.path = [];
				/*this.djisk = function(swl,ewl){
					var range = this.range;//swl.dist(ewl);
					var visited = [swl.toStr()];
					function Spot(wl,path){
						this.wl = wl.copy();
						this.path = path.slice();
					}
					var q = [new Spot(swl,[])];
					while (q.length > 0){
						var cur = q.shift();
						visited.push(cur.wl.toStr());
						var dirs = ["n","e","s","w"];
						for (var i = 0; i < dirs.length; i++){
							var d = explore(cur,dirs[i]);
							if (visited.indexOf(d.wl.toStr())!==-1 || d.wl.dist(this.spawn)>this.range)
								continue;
							if (d.wl.dist(ewl)==0)
								return this.path = d.path;
							else if (visited.indexOf(d.wl.toStr())==-1
								&& Trpg.board.getTile(d.wl).traits.walkable)
								//&& swl.dist(d.wl)<range){
								q.push(d);
							// }
								visited.push(d.wl.toStr());
						}
					}
					function explore(spot, dir){
						var dirs = {
							n:{x:0,y:-1},
							e:{x:1,y:0},
							s:{x:0,y:1},
							w:{x:-1,y:0},
							//ne:{x:1,y:-1},
							//nw:{x:-1,y:-1},
							//se:{x:1,y:1},
							//sw:{x:-1,y:1},
						}
						/*if (dir.length > 1){
							var d = dirs[dir];
							var sideh = spot.wl.copy().shift(d.x,0);
							var sidev = spot.wl.copy().shift(0,d.y);
							
						}*
						var d = dirs[dir];
						var p = spot.path.slice();
						p.push(d);
						return new Spot(spot.wl.copy().shift(d.x,d.y),p);
					}
					
					/*
					function shortest(ogrid){
						var grid = [];
						var p;
						var x, y;
						for (var i = 0; i < ogrid.length; i++){
							var row = [];
							for (var j = 0; j < ogrid.length; j++){
								if (ogrid[i][j] == 1)
									p = {x:j,y:i};
									//x = j;
									//y = i;
								row.push(ogrid[i][j]);
							}
							grid.push(row);
						}
						
						//var x = pos.x;
						//var y = pos.y;
						
						var loc = new Loc(p.x,p.y,[],"start");
						var q = [loc];
						var path = [];
						var i = 0;
						while (q.length > 0){// && i < t*t){
							var cur = q.shift();
							i++;
							
							var w = exploreDir(cur, "KeyW", grid);
							var a = exploreDir(cur, "KeyA", grid);
							var s = exploreDir(cur, "KeyS", grid);
							var d = exploreDir(cur, "KeyD", grid);
							
							var ord = [w,s,a,d];
							var scram = [0,0,0,0];
							while (ord.length > 0){
								var rand = Math.floor(Math.random()*4);
								while (scram[rand] != 0)
									rand = Math.floor(Math.random()*4);
								scram[rand] = ord.shift();
							}
							for (var i = 0; i < scram.length; i++)
								if (scram[i].stat == "visiting")
									q.push(scram[i]);
								else if (scram[i].stat == "goal" && path.length == 0)
									path = scram[i].path.slice();
						}
						return path;
						//if ()
						//return [];
					}
					
					function exploreDir(pos, dir, grid, gost){
						var p = pos.copy();
						switch (dir){
							case "KeyW":	p.y--;	break;
							case "KeyA":	p.x--;	break;
							case "KeyS":	p.y++;	break;
							case "KeyD":	p.x++;	break;
						}
						if (typeof grid == "undefined")
							return p;
						//console.log(p);
						//if ((getG(vgrid,p)!=2&&that.collide(p))
						if (that.oob(p) || getG(grid, p) == 0){
							//setG(vgrid, p, 0);
							p.stat = "blocked";
						}
						else {
							p.path.push(dir);
							if (getG(grid, p) == -1){
								if (!gost)
								setG(grid, p, 0);
								p.stat = "visiting";
							} else if (getG(grid, p) == 2){
								p.stat = "goal";
							}
						}
						return p;
					}
				}*/
				/*this.pickwander = function(){
					//do {
					//	this.targ = this.loc.copy().shift(Math.floor(Math.random()*10)-5,Math.floor(Math.random()*10)-5);
					// } while (this.targ.dist(this.spawn)>=this.range || !Trpg.board.getTile(this.targ).getTrait("walkable"));
					//this.djisk(this.loc,this.targ);
					this.path = Astar(this.loc,Trpg.board.cloc);
					//this.djisk(this.loc,Trpg.board.cloc);
					if (this.path.length > 0)
					this.targ = this.loc.copy().shift(this.path[0].x,this.path[0].y);
					//console.log(this.path);
					//console.log(this.loc.toStr());
					//console.log(this.loc.copy().shift(-3,3).toStr());
				}*/
				this.state = "wander";
				this.changestate = function(state){
					this.state = state;
					this.path = [];
					this.targ = this.loc.copy();
					//console.log(state);
				}
				this.setcb = function(cb){
					this.cb = cb;
					return this;
				}
				this.say = function(str){
					var that = this;
					this.saying = str;
					this.saytimer.start();
					return;
					Trpg.board.container.add(new feedback(str,
					Trpg.board.cloc.mdx(this.loc)*32+16+Trpg.board.container.camera.x,
					Trpg.board.cloc.mdy(this.loc)*32+Trpg.board.container.camera.y,1.5),"feedback");
					//Trpg.board.cloc.dx(this.loc)*32+16+Trpg.board.container.camera.x,
					//Trpg.board.cloc.dy(this.loc)*32+Trpg.board.container.camera.y,1.5),"feedback");
				}
				this.examine = function(){
					this.say("A default entity");
				}
				this.doaction = function(action){
					if (!exists(action))	action = this.actions[0];
					var wl = this.wl;
					switch (action){
						case "examine":
							this.examine();
							break;
						case "attack":
							Trpg.board.playertarget = this;
							break;
					}
				}
				this.fillmenu = function(menu){
					if (this.hp <= 0)
						return;
					var that = this;
					for (var i = 0; i < this.actions.length; i++)
						menu.additem((function(a){return function(){
							//if (Trpg.Home.get("Gameplay").has("currentaction"))
							//	if (Trpg.Home.get("Gameplay.currentaction").wl.dist(that.wl)==0){
							//		Trpg.Home.get("Gameplay").remove("currentaction");
							//		return "close";
							//	}
							that.doaction(that.actions[a]);
							return "close";
							};})(i),that.actions[i].charAt(0).toUpperCase()+that.actions[i].substring(1)
								+" "+this.type+(this.cb > 0?" (lvl "+this.cb+")":""));
				}
				this.update = function(d){
					if (this.hp <= 0)
						return this.respawntimer.update(d);
					//if (this.loc.dist(Trpg.board.cloc)>Trpg.board.viewsize)return;
					switch (this.state){
						case "wander":
							if (Math.random()*1>d)//seconds
								break;
						case "return":
							if (this.path.length > 0 || this.targ.dist(this.loc) > 0)
								break;
							this.changestate("wander");
							/*if (this.loc.dist(Trpg.board.cloc) < this.range && this.spawn.dist(Trpg.board.cloc) < this.range){
								this.changestate("playeragro");
								break;
							}*/
							var targ;
							var reps = 0;
							do {
								reps++;
								targ = this.spawn.copy().shift(
									Math.floor(Math.random()*this.range*2)-this.range,
									Math.floor(Math.random()*this.range*2)-this.range)
								//targ = this.loc.copy().shift(Math.floor(Math.random()*10)-5,Math.floor(Math.random()*10)-5);
							} while (
								reps < 10
								&& (false//targ.dist(this.spawn)>this.range
								|| !Trpg.board.getTile(targ).traits.walkable
								|| Trpg.board.cloc.dist(targ) > Trpg.board.viewsize
								|| Astar(this.loc,targ,10)=="failed"));
							if (reps < 10)
								this.path = Astar(this.loc,targ);
							//else this.path = [];
							//console.log(this.path);
							//if (this.loc.dist(Trpg.board.cloc) < 5 && this.spawn.dist(Trpg.board.cloc)<this.range){
								//this.changestate("playeragro");
							//	console.log("wefr");
							// }
							break;
						case "playeragro":
							if (this.spawn.dist(Trpg.board.cloc) > this.range){
								this.changestate("return");
								return;
							}
							//if (this.path.length > 0 || this.targ.dist(this.loc) > 0)
							//	break;
							if (this.targ.dist(this.loc) > 0)// || this.spawn.dist(Trpg.board.cloc) > this.range)
								break;
							this.path = Astar(this.loc,Trpg.board.cloc,10);
							//if (this.spawn.dist(Trpg.board.cloc) > this.range || this.loc.dist(this.spawn) > this.range)
							//	this.changestate("wander");
							
							break;
					}
					
					if (this.path !== "failed" && this.path.length > 0 && this.targ.dist(this.loc) == 0){
							var p = this.path.shift();
							this.targ.shift(p.x,p.y);
						}
					//if (this.path.length > 0)
					if (this.targ.dist(this.loc) == 1)
						this.move(d);
					/*if (this.loc.dist(Trpg.board.cloc) > Trpg.board.viewsize)
					//	return;
					/*if (this.targ.dist(this.loc) == 0 && this.path.length > 0){
						var dir = this.path.shift();
						this.targ.shift(dir.x,dir.y);
					}
					if (this.path.length > 0)
					//if (this.loc.dist(this.targ) > 0)// || (Math.abs(this.mx-16) > 2 || Math.abs(this.my-16) > 2))
						this.move(d);
					else if (Math.random()<.5*d)*
					//if (this.path.length == 0 || this.path == "failed")// && Math.random()<.5*d)
					//	this.pickwander();
					//if (this.path == "failed")
					//	return;
					if (this.targ.dist(this.loc)==0 && this.path.length > 0){
						if (this.path !== "failed"){
							var p = this.path.shift();
							this.targ.shift(p.x,p.y);
						} else return;
						this.pickwander();
					//}
					if (this.path.length > 0)
						this.move(d);
					//	this.targ.shift()
					//this.targ = this.loc.copy().shift
					*/
				}
				this.move = function(d){
					//var a = Math.atan2(this.loc.dy(this.targ)*32+16-this.my,this.loc.dx(this.targ)*32+16-this.mx);
					var a = Math.atan2(this.loc.mdy(this.targ)*32,this.loc.mdx(this.targ)*32);
					//this.mx+=Math.cos(a)*70*d;
					//this.my+=Math.sin(a)*70*d;
					this.loc.move(Math.cos(a)*this.speed*d,Math.sin(a)*this.speed*d);
					/*
					//if (this.loc.dist(this.targ) == 0)	return;
					var loc = this.loc.copy();
					if (this.mx < 0 || this.mx >= 32){
						loc.cx+=Math.sign(Math.cos(a));
						loc.legalize();
						if (!Trpg.board.getTile(loc).getTrait("walkable")){
							loc.cx-=Math.sign(Math.cos(a));
							loc.legalize();
							this.targ.load(loc);
							this.mx-=Math.cos(a)*70*d;
						} else {
							this.mx-=32*Math.sign(Math.cos(a));
						}
					}
					if (this.my < 0 || this.my >= 32){
						loc.cy+=Math.sign(Math.sin(a));
						loc.legalize();
						if (!Trpg.board.getTile(loc).getTrait("walkable")){
							loc.cy-=Math.sign(Math.sin(a));
							loc.legalize();
							this.targ.load(loc);
							this.my-=Math.sin(a)*70*d;
						} else {
							this.my-=32*Math.sign(Math.sin(a));
						}
					}
					loc.legalize();
					this.loc.load(loc);*/
					//Trpg.board.aim = this.loc;
				}
				this.render = function(g){
					if (this.hp <= 0)
						return;
					//if (this.loc.dist(Trpg.board.cloc)>Trpg.board.viewsize)return;
					var x = /*this.mx/*-Trpg.board.cloc.mx*/Trpg.board.cloc.mdx(this.loc)*32;
					var y = /*this.my/*-Trpg.board.cloc.my*/Trpg.board.cloc.mdy(this.loc)*32;
					g.drawImage(Ast.i("cow"),x,y);
					if (this.hp < this.maxhp){
						var m = 20*this.hp/this.maxhp;
						g.fillStyle = "green";
						g.fillRect(x+6,y-8,m,5)
						g.fillStyle = "red";
						g.fillRect(x+6+m,y-8,20-m,5)
					}
					//console.log(Trpg.board.cloc.mdist(Trpg.board.aim));
				//	console.log(this.loc.toStr());
					if (this.loc.mdist(Trpg.board.aim.copy())<1 || Trpg.board.playertarget == this){
						g.strokeStyle = "yellow";
						if (Trpg.board.cloc.mdist(this.loc) > Trpg.board.attrange)
							g.strokeStyle = "grey";
						g.strokeRect(x,y,32,32);
					}
					if (this.saying == "") return;
					x+=16;
					var w = g.measureText(this.saying).width+5;
					var h = g.measureText("M").width+5;
					g.fillStyle = "white";
					g.globalAlpha = .5;
					g.fillRect(x-w/2,y-h/2,w,h);
					g.globalAlpha = 1;
					g.fillStyle = "black";
					Drw.drawCText(g,this.saying,x,y);
				}
			}
			var ents = {
				Blank:function(){
					this.type = "";
					return this;
				},
				Goblin:function(){
					this.type = "Goblin";
					this.cb = 5;
					this.maxhp = this.hp = 6;
					this.range = 10;
					this.examine = function(){
						this.say("A goblin wandering around aimlessly"+(this.cb>0?" (lvl "+this.cb+")":""));
					}
					return this;
				},
				Guard:function(){
					this.type = "Guard";
					this.cb = 16;
					this.range = 3;
					this.examine = function(){
						this.say("A city guard patrolling the area"+(this.cb>0?" (lvl "+this.cb+")":""));
					}
					return this;
				},
				Cow:function(){
					this.type = "Cow";
					this.cb = 2;
					this.maxhp = this.hp = 8;
					this.actions.unshift("attack");
					this.examine = function(){
						this.say("A harmless cow munching at the grass"+(this.cb>0?" (lvl "+this.cb+")":""));
					}
					return this;
				}
			}
			return ents[type].apply(new Default(wl.copy()));
		}
		this.getents = function(wl){
			var ents = [];
			for (var i = 0; i < this.entities.length; i++)
				if (this.entities[i].loc.mdist(wl)<1)
					ents.push(this.entities[i]);
			return ents;
		}
		
		this.entities = [];//new this.Entity("Guard",new Trpg.WorldLoc(0,1,3,3))];
		this.update = function(d){
			for (var i = 0; i < this.entities.length; i++)
				if (this.entities[i].loc.dist(Trpg.board.cloc)<Trpg.board.viewsize)
					this.entities[i].update(d);
		}
		this.render = function(g){
			for (var i = 0; i < this.entities.length; i++)
				if (this.entities[i].loc.dist(Trpg.board.cloc)<Trpg.board.viewsize)
					this.entities[i].render(g);
		}
	})();
	this.Skills = new (function(){
		function Default(){
			
		}
	})();
	this.Structures = new (function(){
		var sectorsize = 15;
		this.centers = {
			loaded:[],
			queued:[],
			loadedstr:[],
			queuedstr:[]
		}
		this.structs = {}
		this.init = function(){
			this.triggercenter(new Trpg.WorldLoc());
		}
		this.qadjs = function(wl){
			var n = wl.copy();	n.wy-=sectorsize;
			var e = wl.copy();	e.wx+=sectorsize;
			var s = wl.copy();	s.wy+=sectorsize;
			var w = wl.copy();	w.wx-=sectorsize;
			var dirs = [n,e,s,w];
			for (var i = 0; i < dirs.length; i++){
				if (this.centers.loadedstr.indexOf(dirs[i].toStr()) == -1 &&
					this.centers.queuedstr.indexOf(dirs[i].toStr()) == -1){
					this.centers.queued.push(dirs[i]);
					this.centers.queuedstr.push(dirs[i].toStr());
				}
			}
		}
		function Structure(type,cwl,wl) {
			/*function emptylayout(x,y){
				var l = [];
				for (var j = 0; j < y; j++){
					var r = "";
					for (var i = 0; i < x; i++)
						r+="_";
					l.push(r);
				}
				return l;
			}
			function changelayout(l,x,y,a){
				for (var j = 0; j < a.length; j++)
					for (var i = 0; i < a[j].length; i++)
						l[y+j][x+i] = a[j][i];
			}*
			function makelayout(str){
				
			}
			function addspecial(spec,)
			function chunkdiv(l){
				var div = [];
				for (var j = 0; j < l.length; j++)
					for (var i = 0; i < l[j].length; i++)
						;
			}*/
			function Default(cwl,wl){
				this.cwl = cwl.copy();
				this.filled = [];
				this.allfilled = false;
				this.contchunks = [];
				this.inchunk = function(wlstr){
					for (var i = 0; i < this.contchunks.length; i++)
						if (this.contchunks[i] == wlstr)
							return true;
					return false;
				}
				this.spawn = function(){
					var neighbs = Trpg.Structures.structs[this.cwl.toStr()];
					/*
				//	Math.random();
					//if (Math.random()<.8)
					//	this.layout[3]= "wssgssw_";
					//var overlap = true;
					//do {
					//for (var k = 0; overlap && k < 5; k++){
						/*var wings = (sectorsize-1)/2
						this.tlc = this.cwl.copy().tochunk();
						for (var j = -wings; j < wings; j++)//+1
							for (var i = -wings; i < wings; i++){//+1
								var overlap = false;
								for (var k = 0; k < neighbs.length; k++)
									if (neighbs[k].inchunk(this.tlc.copy().shift(8*i,8*j).toStr()))
										overlap = true;
								if (!overlap){
									this.tlc.shift(8*i,8*j);
									this.contchunks = [this.tlc.toStr()];
									return this;
								}
							}								
						return -1;
						*/
						var x = (wl && wl.wx) || Math.floor(Math.random()*(sectorsize-this.cw))-(sectorsize-1)/2;
						var y = (wl && wl.wy) || Math.floor(Math.random()*(sectorsize-this.ch))-(sectorsize-1)/2;
						//top left chunk
						this.tlc = this.cwl.copy().tochunk();
						this.tlc.wx+=x;
						this.tlc.wy+=y;
						this.contchunks = [];
						for (var f in this.layout){
							for (var i = 0; i < this.cw; i++)
								for (var j = 0; j < this.ch; j++)
									this.contchunks.push(this.tlc.copy().shift(8*i,8*j,f).toStr());
							for (var i = 0; i < neighbs.length; i++)
								for (var j = 0; j < this.contchunks.length; j++)
									if (neighbs[i].inchunk(this.contchunks[j])){
										if (exists(wl)){
											neighbs.splice(i--,1);
											j = this.contchunks.length;
										}
										else return -1;
									}
						}
					//if (this.type == "Brumlidge")
					//console.log(this.contchunks);
					return this;
				}
				this.fill = function(wl){
					if (this.filled.indexOf(wl.toStr()) !== -1)	return;
					this.filled.push(wl.toStr());
					if (this.filled.length >= this.contchunks.length) Trpg.Structures.structs[this.cwl.toStr()]
						.splice(Trpg.Structures.structs[this.cwl.toStr()].indexOf(this),1);
					
					var dx = this.tlc.dx(wl);
					var dy = this.tlc.dy(wl);
					//console.log(dx+" "+dy);
					//for (var f in this.layout){
						var f = wl.dim;
						if (!exists(this.layout[f])) return;
						//console.log(f);
						//Trpg.board.save();
						//Trpg.board.load(wl.copy().shift(0,0,f),true);
						for (var j = 0; j < 8; j++)
							for (var i = 0; i < 8; i++){
								var t = this.layout[f][j+dy][i+dx];
								if (t !== "_"){
									//if (t == t.toUpperCase())
									//	this.special(t,i+dx,j+dy);
									//else 
										Trpg.board.setTile(this.acrs[t](wl.copy().shift(i,j,f)),wl.copy().shift(i,j,f));
								}
							}
					// }
					//Trpg.board.save();
					//Trpg.board.load(Trpg.board.cloc,true);
				}
			}
			var structs = {
				/* empty layout
					"________"+"________"+"________"+"________",
					"________"+"________"+"________"+"________",
					"________"+"________"+"________"+"________",
					"________"+"________"+"________"+"________",
					"________"+"________"+"________"+"________",
					"________"+"________"+"________"+"________",
					"________"+"________"+"________"+"________",
					"________"+"________"+"________"+"________",
					
					"________"+"________"+"________"+"________",
					"________"+"________"+"________"+"________",
					"________"+"________"+"________"+"________",
					"________"+"________"+"________"+"________",
					"________"+"________"+"________"+"________",
					"________"+"________"+"________"+"________",
					"________"+"________"+"________"+"________",
					"________"+"________"+"________"+"________",
					
					"________"+"________"+"________"+"________",
					"________"+"________"+"________"+"________",
					"________"+"________"+"________"+"________",
					"________"+"________"+"________"+"________",
					"________"+"________"+"________"+"________",
					"________"+"________"+"________"+"________",
					"________"+"________"+"________"+"________",
					"________"+"________"+"________"+"________",
					
					"________"+"________"+"________"+"________",
					"________"+"________"+"________"+"________",
					"________"+"________"+"________"+"________",
					"________"+"________"+"________"+"________",
					"________"+"________"+"________"+"________",
					"________"+"________"+"________"+"________",
					"________"+"________"+"________"+"________",
					"________"+"________"+"________"+"________",
				*/
				Bank:function(){
					this.type = "Bank";
					this.cw = 1;
					this.ch = 1;
					this.acrs = {
						w:function(){return new Trpg.Tile("CastleWall")},
						s:function(){return new Trpg.Tile("Stone")},
						g:function(){return new Trpg.Tile("Grass")},
						b:function(){return new Trpg.Tile("BankChest").setground("stone")},
						a:function(){return new Trpg.Tile("AlchingStand").setground("stone")},
						//a:function(){return new Trpg.Tile("AlchingStand").setground("stone")},
					}
					/*this.special = function(t){
						switch (t){
							case "B":
								var wl = this.tlc.copy().shift(2,3);
								Trpg.board.setTile(new Trpg.Tile("BankChest")
									.setground("stone"),wl);
								break;
							case "A":
								var wl = this.tlc.copy().shift(4,3);
								Trpg.board.setTile(new Trpg.Tile("AlchingStand")
									.setground("stone"),wl);
								break;
							case "P":
								var wl = this.tlc.copy().shift(3,4);
								Trpg.board.setTile(new Trpg.Tile("Portal")
									.setground("stone")
									.setdest(new Trpg.WorldLoc(-5,7,3,2)),wl);
								break;
						}
					}*/
					this.layout = {
						surface:[
						"________",
						"________",
						"_wwwww__",
						"_wbsaw__",
						"_wsssw__",
						"_wsssw__",
						"_wwgww__",
						"________",
					]}
					return this.spawn();
				},
				Forge:function(){
					this.type = "Forge";
					this.cw = 1;
					this.ch = 1;
					this.acrs = {
						w:function(){return new Trpg.Tile("CastleWall")},
						s:function(){return new Trpg.Tile("Stone")},
						g:function(){return new Trpg.Tile("Grass")},
						f:function(){return new Trpg.Tile("Furnace").setground("stone")},
						a:function(){return new Trpg.Tile("Anvil").setground("stone")},
						c:function(wl){return new Trpg.Tile("Chest")
									.setWl(wl)
									.additem(new Trpg.Item("Knife"))
									.additem(new Trpg.Item("Hammer"))
									.setground("stone")},
					}
					/*this.special = function(t){
						switch (t){
							case "1":
								var wl = this.tlc.copy().shift(3,4);
								Trpg.board.setTile(new Trpg.Tile("Portal")
									.setground("stone")
									.setdest(new Trpg.WorldLoc(-5,7,3,2)),wl);
								break;
							case "F":
								var wl = this.tlc.copy().shift(2,2);
								Trpg.board.setTile(new Trpg.Tile("Furnace")
									.setground("stone"),wl);
								break;
							case "A":
								var wl = this.tlc.copy().shift(4,2);
								Trpg.board.setTile(new Trpg.Tile("Anvil")
									.setground("stone"),wl);
								break;
							case "B":
								var wl = this.tlc.copy().shift(1,4);
								Trpg.board.setTile(new Trpg.Tile("BankChest")//.setWl(wl)
									//.additem(new Trpg.Item("Knife").setinfinite(true))
									/*.setcontents({
										items:[
											new Trpg.Item("Tinderbox").setinfinite(true),
											new Trpg.Item("Hammer").setinfinite(true),
											new Trpg.Item("Ladder").setinfinite(true),
											//new Trpg.Item("Knife").setinfinite(true),
										]})*
									.setground("stone"),wl);
								break;
							case "C":
								var wl = this.tlc.copy().shift(5,4);
								Trpg.board.setTile(new Trpg.Tile("Chest").setWl(wl)
									.additem(new Trpg.Item("Knife"))//.setinfinite(true))
									.additem(new Trpg.Item("Hammer"))//.setinfinite(true))
									//.additem(new Trpg.Item("Ladder"))//.setinfinite(true))
									//.additem(new Trpg.Item("Knife").setinfinite(true))
									/*.setcontents({
										items:[
											new Trpg.Item("Tinderbox").setinfinite(true),
											new Trpg.Item("Hammer").setinfinite(true),
											new Trpg.Item("Ladder").setinfinite(true),
											//new Trpg.Item("Knife").setinfinite(true),
										]})*
									.setground("stone"),wl);
								break;
						}
					}*/
					this.layout = {
					surface:[
					"________",
					"wwwwwww_",
					"wsfsasw_",
					"wsssssw_",
					"wsssscw_",
					"wsssssw_",
					"wsssssw_",
					"wwgggww_"]}
					return this.spawn();
				},
				Tutorville:function(){
					this.type = "Tutorville";
					this.cw = 8;
					this.ch = 8;
					this.acrs = {
						w:"CastleWall",
						s:"Stone",
						g:"Grass",
					}
					return this.spawn();
				},
				Brumlidge:function(){
					this.type = "Brumlidge";
					this.cw = 3;
					this.ch = 3;
					this.acrs = {
						w:function(){return new Trpg.Tile("CastleWall")},
						s:function(){return new Trpg.Tile("Stone")},
						g:function(){return new Trpg.Tile("Grass")},
						u:function(){return new Trpg.Tile("LadderUp").setground("stone")},
						//			.sets({init:function(){
						//				this.setdest(this.wl.copy().shift(0,0,1))}})},
						d:function(){return new Trpg.Tile("LadderDown").setground("stone")},
						//			.sets({init:function(){
						//				this.setdest(this.wl.copy().shift(0,0,-1))}})},
					}
					this.special = function(t,x,y){
						switch (t){
							case "1":
								var wl = this.tlc.copy().shift(x,y);
								Trpg.board.setTile(new Trpg.Tile("LadderUp")
									.setground("stone")
									.setdest(wl.copy().shift(0,0,"floor1")),wl);
								break;
							case "2":
								var wl = this.tlc.copy().shift(17,21);
								Trpg.board.setTile(new Trpg.Tile("LadderUp")
									.setground("stone")
									.setdest(wl.copy().shift(0,0,"floor1")),wl);
								break;
							case "3":
								var wl = this.tlc.copy().shift(6,21);
								Trpg.board.setTile(new Trpg.Tile("LadderDown")
									.setdest(wl),wl.copy().shift(0,0,"floor1"));
								break;
							case "4":
								var wl = this.tlc.copy().shift(17,21);
								Trpg.board.setTile(new Trpg.Tile("LadderDown")
									.setdest(wl),wl.copy().shift(0,0,"floor1"));
								break;
						}
					}
					this.layout = {
						surface:[
						"__wwwwwwwwwwwwwwwwwwww__",
						"_wwssssssssssssssssssww_",
						"wwssssssssssssssssssssww",
						"wssssssssssssssssssssssw",
						"wssssssssssssssssssssssw",
						"wssssssssssssssssssssssw",
						"wwwwwwwwwwwsswwwwwwwwwww",
						"wssssssssssssssssssssssw",
						"wssssssssssssssssssssssw",
						"wsssswwggggggggggwwssssw",
						"wsssswggggggggggggwssssw",
						"wssssgg__________ggssssw",
						"wssssgg__________ggssssw",
						"wssssgg__________ggssssw",
						"wssssgg__________ggssssw",
						"wsssswggggggggggggwssssw",
						"wsssswwggggggggggwwssssw",
						"wssssssssssssssssssssssw",
						"wssssssssssssssssssssssw",
						"wsssswwwwsssssswwwwssssw",
						"wssssssswsssssswsssssssw",
						"wwssssuswwwggwwwsussssww",
						"_wwssssswggggggwsssssww_",
						"__wwwwwwwggggggwwwwwww__"],
						floor1:[
						"__wwwwwwwwwwwwwwwwwwww__",
						"_wwssssssssssssssssssww_",
						"wwssssssssssssssssssssww",
						"wssssssssssssssssssssssw",
						"wssssssssssssssssssssssw",
						"wssssssssssssssssssssssw",
						"wwwwwwwwwwwsswwwwwwwwwww",
						"wssssssssssssssssssssssw",
						"wssssssssssssssssssssssw",
						"wsssswwwwwwwwwwwwwwssssw",
						"wssssw____________wssssw",
						"wssssw____________wssssw",
						"wssssw____________wssssw",
						"wssssw____________wssssw",
						"wssssw____________wssssw",
						"wssssw____________wssssw",
						"wsssswwwwwwwwwwwwwwssssw",
						"wssssssssssssssssssssssw",
						"wssssssssssssssssssssssw",
						"wsssswwwwsssssswwwwssssw",
						"wssssssswsssssswsssssssw",
						"wwssssdswwwwwwwwsdssssww",
						"_wwsssssw______wsssssww_",
						"__wwwwwww______wwwwwww__"]}
					return this.spawn();
				}
			}
			return structs[type].apply(new Default(cwl.copy(),wl&&wl.copy()));
		}
		this.triggercenter = function(wl){
			if (this.centers.loadedstr.indexOf(wl.toStr()) == -1){		
				this.centers.loaded.push(wl);
				this.centers.loadedstr.push(wl.toStr());
			}
			else return;
//			if (this.centers.queued.indexOf(wl) !== -1)
				this.centers.queuedstr.splice(this.centers.queuedstr.indexOf(wl.toStr()),1);
			//generate structures and init surrounding centers
			Math.seedrandom(Trpg.world.wseed+wl.toStr());
			this.structs[wl.toStr()] = [];
			this.structs[wl.toStr()].push(Structure("Brumlidge",wl,new Trpg.WorldLoc(-2,-1)));
			//if (wl.dist(new Trpg.WorldLoc())==0)
			//	this.structs[wl.toStr()].push(Structure("Brumlidge",wl));
			for (var i = 0; i < Math.random()*5+5; i++){
				var s =  Structure("Forge",wl); //new 
				if (s !== -1)	this.structs[wl.toStr()].push(s);
			}
			for (var i = 0; i < Math.random()*5+5; i++){
				var s =  Structure("Bank",wl); //new 
				if (s !== -1)	this.structs[wl.toStr()].push(s);
			}
			this.qadjs(wl);
		}
		this.getcenter = function(wl){
			wl = wl.copy().tochunk();
			for (var i = 0; i < this.centers.queued.length; i++)
				if (wl.dist(this.centers.queued[i]) <= 8*(sectorsize+3)/2){
					this.triggercenter(this.centers.queued[i]);
					//break;
				}
			for (var i = 0; i < this.centers.loaded.length; i++)
				if (wl.dist(this.centers.loaded[i]) <= 8*(sectorsize-1)/2)
					return this.centers.loaded[i];
			return -1;
		}
		this.checkchunk = function(wl){
			var center = this.getcenter(wl);
			if (center == -1 || !exists(this.structs[center.toStr()]))	return;
			for (var i = 0; i < this.structs[center.toStr()].length; i++)
				if (this.structs[center.toStr()][i].inchunk(wl.copy().tochunk().toStr()))
					this.structs[center.toStr()][i].fill(wl.copy());
			return false;
		}
	})();
	this.Tile = function(type){//,args){
		function Default(){
			this.type = "default";
			this.board = true;
			this.state = {};
			this.traits = {};
			this.getcolor = function(){	return this.avecolor || "black"}
			this.getTrait = function(trait){
				if (this.traits.hasOwnProperty(trait))
					return this.traits[trait];
				return false;
			}
			this.getstate=function(){return this.type}
			this.setState = function(loadobj,state){
				//	this = object to save state into
				//	loadobj = object to load state into
				return this; // save object
			}
			this.setground = function(ground){
				this.ground = ground;
				return this;
			}
			this.getdefground = function(wl){
				switch (wl.dim){
					case "floor2":
					case "floor1":			return "stone";
					case "surface":			return "grass";
					case "underground1":	return "stone";
					case "underground2":	return "stone";
				}
			}
			this.setWl = function(wl){	
				this.wl = wl;	
				this.init && this.init.call(this);
				if (exists(this.ground))	return this;
				return this.setground(this.getdefground(wl));
			}
			this.actions = [];
			this.getActions = function(){return this.actions;}
			this.fillmenu = function(menu){
				//menu.removeall();
				var that = this;
				
				//menu.additem(function(){console.log(Astar(Trpg.board.cloc,Trpg.board.aim))},"path");
				/*if (Trpg.invent.using !== -1){
					menu.additem(function(){
						Trpg.invent.using.useon(that);
						return "close,empty";
					},Trpg.invent.using.type+" -> "+that.type);
					return;
				}
				var ents = Trpg.Entities.getents(this.wl);
				for (var i = 0; i < ents.length; i++)
				
				var items = Trpg.board.ground.items[this.wl.toStr()];//getitems(this.wl);
				//var that = this;
				*/
				for (var i = 0; i < this.actions.length; i++)
					menu.additem((function(a){return function(){
						if (Trpg.Home.get("Gameplay").has("currentaction"))
							if (Trpg.Home.get("Gameplay.currentaction").wl.dist(that.wl)==0){
								Trpg.Home.get("Gameplay").remove("currentaction");
								return "close";
							}
						that.doaction(that.actions[a]);
						return "close";
						};})(i),that.actions[i].charAt(0).toUpperCase()+that.actions[i].substring(1)
							+" "+this.type);
				/*if (items && items.length > 0)
				for (var i = 0; i < items.length; i++)
					menu.additem((function(a){return function(){
						Trpg.invent.pickupitem(a,that.wl.copy());
						return "remove";
						//that.doaction(items[a]);
						//return "close";
					};})((function(b){return items[b].item})(i))
					//items[i].item)
					,items[i].item.type,"orange");*/
					/*//that.menu.onempty = function(){that.empty = true}
					var items = that.contents.items;
					that.menu.additem(function(){},"Chest","white");
					for (var i = 0; i < items.length; i++){
						that.menu.additem();
					}
				for (var i = 0; i < this.actions.length; i++){
					
				}
				*/
				//return menu;
			}
			this.hasAction = function(action){	return this.getActions().indexOf(action)!=-1;}
			this.getDelay = function(action){	return 0;	}
			this.doaction = function(action){}
			this.load = function(save){
				this.update(save.count);
				this.ground = save.ground;
			}
			this.save = function(){
				return {
					type:this.type,
					ground:this.ground,
					count:exists(this.growtimer) ? this.growtimer.count : 0
				}
			}
			this.update = function(d){}
			this.render = function(g){
				g.drawImage(Ast.i(this.ground),0,0);
				g.drawImage(Ast.i(this.type.toLowerCase()),0,0);
			}
		}
		var tiles = {	
			Void:function(){
				this.type = "Void";
				this.render = function(g){
					//g.drawImage(Ast.i("grass"),0,0);
				}
				return this;
			},
			Grass:function(){
				this.type = "Grass";
				this.actions = ["dig"];
				this.avecolor = "#90D747";
				this.traits.burnable = true;
				this.traits.walkable = true;
				//this.avecolor = 
				this.doaction = function(action){
					if (!exists(action))	action = this.getActions()[0];
					var wl = this.wl;
					switch (action){
						//case "wall":
						//	Trpg.board.setTile(new Trpg.Tile("CastleWall"),wl);
						//	break;
						//case "portal":
						//	Trpg.board.setTile(new Trpg.Tile("Portal"),wl);
						//	break;
						case "dig":
							var timer = new Utils.Timer(.7).start().setAuto(true,function(){
								Trpg.board.setTile(new Trpg.Tile("Hole"),wl);
							}).setKilloncomp(true);
							timer.board = true;
							timer.wl = wl;
							Trpg.Home.add(timer,"Gameplay.currentaction");
							break;
						case "plow":
							var timer = new Utils.Timer(1.2).start().setAuto(true,function(){
								Trpg.board.setTile(new Trpg.Tile("PlowedDirt"),wl);
							}).setKilloncomp(true);
							timer.board = true;
							timer.wl = wl;
							Trpg.Home.add(timer,"Gameplay.currentaction");
							break;
					}
				}
				this.render = function(g){
					g.drawImage(Ast.i("grass"),0,0);
				}
				return this;
			},
			PlowedDirt:function(){
				var that = this;
				this.type = "PlowedDirt";
				this.actions = ["dig"];
				this.traits.walkable = true;
				this.growtimer = new Utils.Timer(5).setAuto(true,function(){
					Trpg.board.setTile(new Trpg.Tile("Grass"),that.wl);
				}).start();
				this.doaction = function(action){
					if (!exists(action))	action = this.getActions()[0];
					var wl = this.wl;
					switch (action){
						case "dig":
							var timer = new Utils.Timer(.7).start().setAuto(true,function(){
								Trpg.board.setTile(new Trpg.Tile("Hole"),wl);
							}).setKilloncomp(true);
							timer.board = true;
							timer.wl = wl;
							Trpg.Home.add(timer,"Gameplay.currentaction");
							break;
					}
				}
				this.update = function(d){
					this.growtimer.update(d);
				}
				this.render = function(g){
					g.drawImage(Ast.i("ploweddirt"),0,0);
					this.growtimer.renderp(g);
				}
				return this;
			},
			Hole:function(){
				this.type = "Hole";
				this.traits.burnable = true;
				this.traits.walkable = true;
				this.avecolor = "#90D747";
				this.actions = ["fill","plant","excavate"];
				this.doaction = function(action){
					if (!exists(action))	action = this.getActions()[0];
					var wl = this.wl;
					switch (action){
						case "fill":
							var timer = new Utils.Timer(1).start().setAuto(true,function(){
								Trpg.board.setTile(new Trpg.Tile("Grass"),wl);
							}).setKilloncomp(true);
							timer.board = true;
							timer.wl = wl;
							Trpg.Home.add(timer,"Gameplay.currentaction");
							break;
						case "excavate":
							var z = Trpg.Home.get("Gameplay.Board").camera.getzoom();
							if (!Trpg.invent.hasitem("Ladder")){
								Trpg.board.container.add(new feedback("You need a ladder to go underground",
								//Trpg.Home.get("Gameplay").add(new feedback("You need a ladder to go underground",
								Trpg.board.cloc.dx(wl)*32+16+Trpg.board.container.camera.x,
								Trpg.board.cloc.dy(wl)*32+Trpg.board.container.camera.y,1.5),"feedback");
								break;
							}
							var timer = new Utils.Timer(1).start().setAuto(true,function(){
								Trpg.invent.removeitem("Ladder");
								Trpg.board.setTile(new Trpg.Tile("LadderDown").setdest(wl.copy().shift(0,0,"underground1")),wl);
								Trpg.board.save();
								Trpg.board.load(wl.copy().shift(0,0,"underground1"),true)
								Trpg.board.setTile(new Trpg.Tile("LadderUp").setground("stone").setdest(wl),wl.copy().shift(0,0,"underground1"));
								Trpg.board.save();
								Trpg.board.load(Trpg.board.cloc,true);
							}).setKilloncomp(true);
							timer.board = true;
							timer.wl = wl;
							Trpg.Home.add(timer,"Gameplay.currentaction");
							break;
						case "plant":
							if (!Trpg.invent.hasitem("Seed")){
								Trpg.board.container.add(new feedback("You don't have any seeds to plant",
								//Trpg.Home.get("Gameplay.Menus").add(new feedback("You don't have any seeds",
								Trpg.board.cloc.dx(wl)*32+16+Trpg.board.container.camera.x,
								Trpg.board.cloc.dy(wl)*32+Trpg.board.container.camera.y,1.5),"feedback");
								return;
							}
							Trpg.invent.removeitem("Seed");
							Trpg.board.setTile(new Trpg.Tile("Seedling"),wl);
							break;
					}
				}
				return this;
			},
			Portal:function(){
				this.type = "Portal";
				this.avecolor = "#0088D4";
				this.traits.walkable = true;
				this.actions = ["teleport"];
				this.setdest = function(wl){
					this.destwl = wl.copy();
					return this;
				}
				this.doaction = function(action){
					if (!exists(action))	action = this.getActions()[0];
					var wl = this.wl;
					var that = this;
					switch (action){
						case "climb":
						case "descend":
						case "teleport":
							//console.log(that);
							if (!exists(that.destwl) && action == "teleport")return;
							//var dest = this.destwl.copy();
							//if (action == "teleport")
							//	dest = this.destwl.copy();
							if (action == "climb")
								this.destwl = this.wl.copy().shift(0,0,1);
							if (action == "descend")
								this.destwl = this.wl.copy().shift(0,0,-1);
							if (Trpg.Home.get("Gameplay").has("currentaction"))
								Trpg.Home.get("Gameplay").remove("currentaction");
							Trpg.board.save();
							Trpg.board.cloc.load(this.destwl.copy());
							Trpg.board.cloc.mx =
							Trpg.board.cloc.my = 16;
							Trpg.board.load(Trpg.board.cloc,true);
							break;
					}
				}
				this.load = function(save){
					this.ground = save.ground;
					this.destwl = new Trpg.WorldLoc().load(JSON.parse(save.dest));
				}
				this.save = function(){
					return {
						type:this.type,
						ground:this.ground,
						count:0,//exists(this.growtimer) ? this.growtimer.count : 0
						dest:JSON.stringify(this.destwl)
					}
				}/*
				this.render = function(g){
					g.drawImage(Ast.i(this.ground),0,0);
					g.drawImage(Ast.i("bportal"),0,0);
				}*/
				return this;
			},
			/*Ladder:function(){
				tiles.Portal.call(this);
				this.type = "Ladder";
				this.avecolor = "#915E21";
				this.up = true;
				this.setgoup = function(up){
					this.up = up;
					if (this.up)
						this.actions = ["climb"];
					else this.actions = ["descend"];
					return this;
				}
				this.init = function(){
					if (this.up)
						 this.setdest(this.wl.copy().shift(0,0,1));
					else this.setdest(this.wl.copy().shift(0,0,-1));
					//this.setgoup(this.up);
					return this;
				}
				this.render = function(g){
					g.drawImage(Ast.i(this.ground),0,0);
					g.drawImage(Ast.i("ladder"+(this.up?"up":"down")),0,0);
				}
				return this;
			},*/
			LadderUp:function(){
				tiles.Portal.call(this);
				//var p = new Trpg.Tile("Portal");
				this.type = "LadderUp";
				this.avecolor = "#915E21";
				//this.traits.walkable = true;
				this.actions = ["climb"];
				this.init = function(){
					this.destwl = this.wl.copy().shift(0,0,1);
				}
				/*
				//this.setdest = function(wl){
				//	this.destwl = wl.copy();
				//	return this;
				//}
				this.doaction = function(action){
					if (!exists(action))	action = this.getActions()[0];
					var wl = this.wl;
					switch (action){
						case "climb":
							if (Trpg.Home.get("Gameplay").has("currentaction"))
								Trpg.Home.get("Gameplay").remove("currentaction");
							var newwl = wl.copy();
							newwl.dim = "surface";
							Trpg.board.save();
							Trpg.board.cloc.load(newwl);
							Trpg.board.mx =
							Trpg.board.my = 16;
							Trpg.board.load(Trpg.board.cloc,true);
							break;
					}
				}*/
				this.render = function(g){
					g.drawImage(Ast.i(this.ground),0,0);
					g.drawImage(Ast.i("ladderup"),0,0);
				}
				return this;
			},
			LadderDown:function(){
				//var p = new Trpg.Tile("Portal");
				tiles.Portal.call(this);
				this.type = "LadderDown";
				this.avecolor = "#915E21";
				//this.traits.walkable = true;
				this.actions = ["descend"];//,"remove"];
				this.init = function(){
					this.destwl = this.wl.copy().shift(0,0,-1);
				}
				/*
				this.doaction = function(action){
					if (!exists(action))	action = this.getActions()[0];
					var wl = this.wl;
					var that = this;
					switch (action){
						case "climb":
						case "teleport":
							if (!exists(that.destwl))return;
							if (Trpg.Home.get("Gameplay").has("currentaction"))
								Trpg.Home.get("Gameplay").remove("currentaction");
							Trpg.board.save();
							Trpg.board.cloc.load(this.destwl.copy());
							Trpg.board.cloc.mx =
							Trpg.board.cloc.my = 16;
							Trpg.board.load(Trpg.board.cloc,true);
							break;
						case "remove":
							var timer = new Utils.Timer(1).start().setAuto(true,function(){
								Trpg.invent.additem(new Trpg.Item("Ladder"));
								Trpg.board.setTile(new Trpg.Tile("Hole"),wl);
								Trpg.board.save();
								Trpg.board.load(wl.copy().shift(0,0,"underground1"),true)
								Trpg.board.setTile(new Trpg.Tile("Stone"),wl.copy().shift(0,0,"underground1"));
								Trpg.board.save();
								Trpg.board.load(Trpg.board.cloc,true);
							}).setKilloncomp(true);
							timer.board = true;
							timer.wl = wl;
							Trpg.Home.add(timer,"Gameplay.currentaction");
							break
					}
				}
				/*
				//this.setdest = function(wl){
				//	this.destwl = wl.copy();
				//	return this;
				//}
				this.doaction = function(action){
					if (!exists(action))	action = this.getActions()[0];
					var wl = this.wl;
					switch (action){
						case "climb":
							if (Trpg.Home.get("Gameplay").has("currentaction"))
								Trpg.Home.get("Gameplay").remove("currentaction");
							var newwl = wl.copy();
							newwl.dim = "surface";
							Trpg.board.save();
							Trpg.board.cloc.load(newwl);
							Trpg.board.mx =
							Trpg.board.my = 16;
							Trpg.board.load(Trpg.board.cloc,true);
							break;
					}
				}*/
				this.render = function(g){
					g.drawImage(Ast.i(this.ground),0,0);
					g.drawImage(Ast.i("ladderdown"),0,0);
				}
				return this;
			},
			AlchingStand:function(){
				this.type = "AlchingStand";
				this.actions = ["alch"];
				this.doaction = function(action){
					if (!exists(action))
						action = this.getActions()[0];
					var wl = this.wl;
					switch (action){
						case "alch":
							if (Trpg.invent.getempty() == 35){//.items.length == 0){
								Trpg.board.container.add(new feedback("You have nothing to alch",
								Trpg.board.cloc.dx(wl)*32+16+Trpg.board.container.camera.x,
								Trpg.board.cloc.dy(wl)*32+Trpg.board.container.camera.y,1.5),"feedback");
								return;
							}
							Trpg.invent.withdrawing = this;
							break;
					}
				}
				this.getwithdraw = function(item,menu){
					var that = this;
					var wl = this.wl;
					/*if (!item.alchable){
						Trpg.board.container.add(new feedback("You can't alch this item",
						Trpg.board.cloc.dx(wl)*32+16+Trpg.board.container.camera.x,
						Trpg.board.cloc.dy(wl)*32+Trpg.board.container.camera.y,1.5),"feedback");
					}*/
					if (item.alchable)
					menu.additem(function(){
						if (item !== "empty")
							that.deposit(item);
					},"Alch ("+item.alchvalue+")","yellow");
				}
				this.deposit = function(item){
					Trpg.invent.removeitem(item);
					Trpg.invent.additem(new Trpg.Item("Coins"),item.alchvalue);
				}
				return this;
			},
			Furnace:function(){
				this.type = "Furnace";
				this.avecolor = "#575757";
				this.actions = ["smelt"];
				this.fillmenu = function(menu){
					var that = this;
					var wl = this.wl;
					menu.removeall();
					if (Trpg.invent.using !== -1){
						menu.additem(function(){
							Trpg.invent.using.useon(that);
							return "close,empty";
						},Trpg.invent.using.type+" -> "+that.type);
						return;
					}
					/*
					var metals = {
						Eternium:[{t:"EterniumOre",a:1},{t:"CoalOre",a:16}],
						Rune:[{t:"EterniumOre",a:1},{t:"CoalOre",a:16}],
						Adamant:[{t:"EterniumOre",a:1},{t:"CoalOre",a:16}],
						Mithril:[{t:"EterniumOre",a:1},{t:"CoalOre",a:16}],
						Steel:[{t:"EterniumOre",a:1},{t:"CoalOre",a:16}],
						Iron:[{t:"EterniumOre",a:1},{t:"CoalOre",a:16}],
						Bronze:[{t:"EterniumOre",a:1},{t:"CoalOre",a:16}],
					}*/
					var metals = [
						"Eternium",
						"Runite",
						"Adamant",
						"Mithril",
						"Steel",
						"Iron",
						"Bronze"
					]
					var colors = [
					"#FFD800",
					"#0B8E9D",
					"#599561",
					"#213B91",
					"#9C9C9C",
					"#707070",
					"#895832",
					]
					for (var i = 0; i < metals.length; i++)
						if (new Trpg.Item(metals[i]+"Bar").cansmelt())
							menu.additem((function(metal){
								return function(){
									if (Trpg.Home.get("Gameplay").has("currentaction"))
										if (Trpg.Home.get("Gameplay.currentaction").wl.dist(that.wl)==0){
											Trpg.Home.get("Gameplay").remove("currentaction");
											return "close";
										}
									new Trpg.Item(metal).smelt(that);
									return "close";
								}
							})(metals[i]+"Bar"),metals[i],colors[i]);
					/*if (menu.itemcount == 0){
						Trpg.board.container.add(new feedback("You need a some tin and copper ore",
						Trpg.board.cloc.dx(wl)*32+16+Trpg.board.container.camera.x,
						Trpg.board.cloc.dy(wl)*32+Trpg.board.container.camera.y,1.5),"feedback");
					}*/
					if (menu.itemcount == 0)
						menu.additem(function(){
							if (menu.hidden){
								Trpg.board.container.add(new feedback("You don't have enough materials to smelt",
								Trpg.board.cloc.dx(wl)*32+16+Trpg.board.container.camera.x,
								Trpg.board.cloc.dy(wl)*32+Trpg.board.container.camera.y,1.5),"feedback");
							}
						},"Smelt");
					return;
					menu.additem(function(){
						if (Trpg.Home.get("Gameplay").has("currentaction"))
							if (Trpg.Home.get("Gameplay.currentaction").wl.dist(that.wl)==0){
								Trpg.Home.get("Gameplay").remove("currentaction");
								return "close";
							}
						if (!(Trpg.invent.hasitem("TinOre") && Trpg.invent.hasitem("CopperOre"))){
							Trpg.board.container.add(new feedback("You need a some tin and copper ore",
							Trpg.board.cloc.dx(wl)*32+16+Trpg.board.container.camera.x,
							Trpg.board.cloc.dy(wl)*32+Trpg.board.container.camera.y,1.5),"feedback");
						}
						var timer = new Utils.Timer(1.3).start().setLoop(true).setAuto(true,function(){
							if (!(Trpg.invent.hasitem("TinOre") && Trpg.invent.hasitem("CopperOre")))
								return;
							Trpg.invent.removeitem("TinOre");
							Trpg.invent.removeitem("CopperOre");
							Trpg.invent.additem(new Trpg.Item("BronzeBar"));
							if (!Trpg.invent.hasitem("TinOre") || !Trpg.invent.hasitem("CopperOre"))
								timer.setKilloncomp(true);
						});
						timer.board = true;
						timer.wl = wl;
						Trpg.Home.add(timer,"Gameplay.currentaction");
							return "close";
					},"Bronze","brown");
				}
				this.doaction = function(action){
					if (!exists(action))
						action = this.getActions()[0];
					var wl = this.wl;
					switch (action) {
						case "smelt":
							if (!(Trpg.invent.hasitem("TinOre") && Trpg.invent.hasitem("CopperOre"))){
								Trpg.board.container.add(new feedback("You need a some tin and copper ore",
								Trpg.board.cloc.dx(wl)*32+16+Trpg.board.container.camera.x,
								Trpg.board.cloc.dy(wl)*32+Trpg.board.container.camera.y,1.5),"feedback");
								return;
							}
							var timer = new Utils.Timer(1.3).start().setAuto(true,function(){
								if (!(Trpg.invent.hasitem("TinOre") && Trpg.invent.hasitem("CopperOre")))
									return;
								Trpg.invent.removeitem("TinOre");
								Trpg.invent.removeitem("CopperOre");
								Trpg.invent.additem(new Trpg.Item("BronzeBar"));
							}).setKilloncomp(true);
							timer.board = true;
							timer.wl = wl;
							Trpg.Home.add(timer,"Gameplay.currentaction");
							break;
					}
				}
				return this;
			},
			Anvil:function(){
				this.type = "Anvil";
				this.avecolor = "#C6ABA2";
				this.actions = ["smith"];
				this.fillmenu = function(menu){
					var that = this;
					var wl = this.wl;
					menu.removeall();
					if (Trpg.invent.using !== -1){
						menu.additem(function(){
							Trpg.invent.using.useon(that);
							return "close,empty";
						},Trpg.invent.using.type+" -> "+that.type);
						return;
					}
					var metals = [
					"Eternium",
					"Runite",
					"Adamant",
					"Mithril",
					"Steel",
					"Iron",
					"Bronze",
					]
					var colors = [
					"#FFD800",
					"#0B8E9D",
					"#599561",
					"#213B91",
					"#9C9C9C",
					"#707070",
					"#895832",
					]
					for (var i = 0; i < metals.length; i++)
						if (Trpg.invent.hasitem(metals[i]+"Bar"))
						menu.additem((function(metal){
							return function(){
								if (Trpg.Home.get("Gameplay").has("currentaction"))
									if (Trpg.Home.get("Gameplay.currentaction").wl.dist(that.wl)==0){
										Trpg.Home.get("Gameplay").remove("currentaction");
										return "close";
									}
								/*if (!Trpg.invent.hasitem(metal+"Bar")){
									Trpg.board.container.add(new feedback("You need a some "+metal.toLowerCase()+" bars",
									Trpg.board.cloc.dx(wl)*32+16+Trpg.board.container.camera.x,
									Trpg.board.cloc.dy(wl)*32+Trpg.board.container.camera.y,1.5),"feedback");
								}*/
								that.refillmenu(menu,metal);
								menu.open();
							}
						})(metals[i]),metals[i],colors[i]);
					if (menu.itemcount == 0){
						menu.additem(function(){
							if (menu.hidden){
								Trpg.board.container.add(new feedback("You don't have any bars to smith",
								Trpg.board.cloc.dx(wl)*32+16+Trpg.board.container.camera.x,
								Trpg.board.cloc.dy(wl)*32+Trpg.board.container.camera.y,1.5),"feedback");
							}
						},"Smith");
					}
				/*	menu.additem(function(){
						if (!Trpg.invent.hasitem("BronzeBar")){// && Trpg.invent.hasitem("CopperOre"))){
							Trpg.board.container.add(new feedback("You need a some bronze bars",
							Trpg.board.cloc.dx(wl)*32+16+Trpg.board.container.camera.x,
							Trpg.board.cloc.dy(wl)*32+Trpg.board.container.camera.y,1.5),"feedback");
						}
						that.refillmenu(menu,"Bronze");
						menu.open();
						//	return "close";
						/*var timer = new Utils.Timer(1.3).start().setLoop(true).setAuto(true,function(){
							if (!(Trpg.invent.hasitem("TinOre") && Trpg.invent.hasitem("CopperOre")))
								return;
							Trpg.invent.removeitem("TinOre");
							Trpg.invent.removeitem("CopperOre");
							Trpg.invent.additem(new Trpg.Item("BronzeBar"));
							if (!Trpg.invent.hasitem("TinOre") || !Trpg.invent.hasitem("CopperOre"))
								timer.setKilloncomp(true);
						});
						timer.board = true;
						timer.wl = wl;
						Trpg.Home.add(timer,"Gameplay.currentaction");*/
					// },"Bronze","brown");
				}
				this.refillmenu = function(menu,metal){
					var that = this;
					var wl = this.wl;
					menu.removeall();
					var items = [
						["Dagger"],
						["Helm"],
						["Kite"],
						["Legs"],
						["Body"],
					],
					colors = {
					Eternium:"#FFD800",
					Runite:"#0B8E9D",
					Adamant:"#599561",
					Mithril:"#213B91",
					Steel:"#9C9C9C",
					Iron:"#707070",
					Bronze:"#895832",
					};
					for (var i = 0; i < 5; i++)
						if (Trpg.invent.hasitem(metal+"Bar",i+1))
							for (var j = 0; j < items[i].length; j++)
								menu.additem((function(m,t,r){
									return function(){
										var mm = m
										if (m == "Runite")	mm = "Rune";
										if (!Trpg.invent.hasitem(m+"Bar",r))	return "close";
										var timer = new Utils.Timer(.7*r).start().setAuto(true,function(){
													if (!Trpg.invent.hasitem(m+"Bar",r))	return "close";
													Trpg.invent.removeitem(m+"Bar",r);
													Trpg.invent.additem(new Trpg.Item(mm+t));
										}).setKilloncomp(true);
										timer.board = true;
										timer.wl = wl;
										Trpg.Home.add(timer,"Gameplay.currentaction");
										return "close";
									}
								})(metal,items[i][j],i+1),items[i][j],colors[metal]);
							/*if (Trpg.invent.hasitem("BronzeBar",1))
							menu.add(new UI.Button(0,0*35,135,35).sets({text:"Dagger",onclick:function(){
								if (Trpg.invent.hasitem("BronzeBar",1))
									maketimer(smith.bind(this,"Bronze","Dagger",1),1*.7);
								menu.removeme = true;
								
						var timer = new Utils.Timer(1.3).start().setLoop(true).setAuto(true,function(){
							if (!(Trpg.invent.hasitem("TinOre") && Trpg.invent.hasitem("CopperOre")))
								return;
							Trpg.invent.removeitem("TinOre");
							Trpg.invent.removeitem("CopperOre");
							Trpg.invent.additem(new Trpg.Item("BronzeBar"));
							if (!Trpg.invent.hasitem("TinOre") || !Trpg.invent.hasitem("CopperOre"))
								timer.setKilloncomp(true);
						});
						
							}}));function smith(bartype, item, barsreq){
								Trpg.invent.removeitem(bartype+"Bar",barsreq);
								Trpg.invent.additem(new Trpg.Item(bartype+item));
							}*/
				}
				/*this.makemenu = function(){
					var that = this;
					that.menu = new BoardMenu(that.wl);
					//that.menu.onempty = function(){that.empty = true}
					var items = that.contents.items;
					that.menu.setheader("Chest","white");
					for (var i = 0; i < items.length; i++){
						that.menu.additem((function(a){return function(){
							if (Trpg.invent.getempty() == 0){
								that.menu.container.remove(that.menu);
								Trpg.board.container.add(new feedback("Not enough room",
								Trpg.board.cloc.dx(that.wl)*32+16+Trpg.board.container.camera.x,
								Trpg.board.cloc.dy(that.wl)*32+Trpg.board.container.camera.y,1.5),"feedback");
								return "close";
							}
							Trpg.invent.additem(a.copy().setinfinite(false));
							if (!a.infinite){
								items.splice(items.indexOf(a),1);
								return "remove";
							} else return "";
							return "remove";
						};})(items[i]),items[i].type,"orange");
					}
				}*/
				this.doaction = function(action){
					if (!exists(action))
						action = this.getActions()[0];
					var wl = this.wl.copy();
					switch (action) {
						case "smith":
						/*
							var z = Trpg.Home.get("Gameplay.Board").camera.getzoom();
							if (!Trpg.invent.hasitem("BronzeBar")||!Trpg.invent.hasitem("Hammer")){
								Trpg.board.container.add(new feedback("You need a hammer and some bronze bars",
								Trpg.board.cloc.dx(wl)*32+16+Trpg.board.container.camera.x,
								Trpg.board.cloc.dy(wl)*32+Trpg.board.container.camera.y,1.5),"feedback");
								break;
							}
							//console.log(Trpg.invent.getitemamt("BronzeBar"));
							var menu = new UI.DBox(0,0,135,35*Trpg.invent.getitemamt("BronzeBar"));
							menu.cropped = false;
							Trpg.Home.add(menu,"Gameplay.");
							menu.add({
								mousemove:function(e,m){
									if (!this.container.mouseonbox(m))
										this.container.removeme = true;
								},
								keydown:function(k){
									this.container.removeme = true;
								},
								update:function(){
									this.container.x = 410+Trpg.board.cloc.dx(wl)*32*z-z*Trpg.board.mx;
									this.container.y = 417+Trpg.board.cloc.dy(wl)*32*z-z*Trpg.board.my;
									if (this.container.removeme)
										this.container.container.remove(this.container);
								}
							})
							if (Trpg.invent.hasitem("BronzeBar",1))
							menu.add(new UI.Button(0,0*35,135,35).sets({text:"Dagger",onclick:function(){
								if (Trpg.invent.hasitem("BronzeBar",1))
									maketimer(smith.bind(this,"Bronze","Dagger",1),1*.7);
								menu.removeme = true;
								
							}}));
							if (Trpg.invent.hasitem("BronzeBar",2))
							menu.add(new UI.Button(0,1*35,135,35).sets({text:"Helm",onclick:function(){
								if (Trpg.invent.hasitem("BronzeBar",2))
									maketimer(smith.bind(this,"Bronze","Helm",2),2*.7);
								menu.removeme = true;
								
							}}));
							//console.log(Trpg.invent.hasitem("BronzeBar",3));
							if (Trpg.invent.hasitem("BronzeBar",3))
							menu.add(new UI.Button(0,2*35,135,35).sets({text:"Kite",onclick:function(){
								if (Trpg.invent.hasitem("BronzeBar",3))
									maketimer(smith.bind(this,"Bronze","Kite",3),3*.7);
								menu.removeme = true;
								
							}}));
							if (Trpg.invent.hasitem("BronzeBar",4))
							menu.add(new UI.Button(0,3*35,135,35).sets({text:"Legs",onclick:function(){
								if (Trpg.invent.hasitem("BronzeBar",4))
									maketimer(smith.bind(this,"Bronze","Legs",4),4*.7);
								menu.removeme = true;
								
							}}));
							if (Trpg.invent.hasitem("BronzeBar",5))
							menu.add(new UI.Button(0,4*35,135,35).sets({text:"Body",onclick:function(){
								if (Trpg.invent.hasitem("BronzeBar",5))
									maketimer(smith.bind(this,"Bronze","Body",5),5*.7);
								menu.removeme = true;
								
							}}));
							function smith(bartype, item, barsreq){
								Trpg.invent.removeitem(bartype+"Bar",barsreq);
								Trpg.invent.additem(new Trpg.Item(bartype+item));
							}
							function maketimer(infunc,delay){
								var timer = new Utils.Timer(delay).start().setAuto(true,function(){
									infunc();
									/*if (!Trpg.invent.hasitem("BronzeBar"))
										return;
									var amt ;
									for (amt = 0; amt<35; amt++)
										if (!Trpg.invent.hasitem("BronzeBar",amt)){
											amt--;
											break;
										}
									var item;
									switch (amt){
										case 1:		item = new Trpg.Item("BronzeDagger");	break;
										case 2:		item = new Trpg.Item("BronzeHelm");		break;
										case 3:		item = new Trpg.Item("BronzeKite");		break;
										case 4:		item = new Trpg.Item("BronzeLegs");		break;
										default:	amt = 5;
										case 5:		item = new Trpg.Item("BronzeBody");		break;
									}
									for (var i = 0; i < amt; i++)
										Trpg.invent.removeitem("BronzeBar");
									Trpg.invent.additem(item);*
								}).setKilloncomp(true);
								timer.board = true;
								timer.wl = wl;
								Trpg.Home.add(timer,"Gameplay.currentaction");
							}
							/*var timer = new Utils.Timer(2).start().setAuto(true,function(){
								if (!Trpg.invent.hasitem("BronzeBar"))
									return;
								var amt ;
								for (amt = 0; amt<35; amt++)
									if (!Trpg.invent.hasitem("BronzeBar",amt)){
										amt--;
										break;
									}
								var item;
								switch (amt){
									case 1:		item = new Trpg.Item("BronzeDagger");	break;
									case 2:		item = new Trpg.Item("BronzeHelm");		break;
									case 3:		item = new Trpg.Item("BronzeKite");		break;
									case 4:		item = new Trpg.Item("BronzeLegs");		break;
									default:	amt = 5;
									case 5:		item = new Trpg.Item("BronzeBody");		break;
								}
								for (var i = 0; i < amt; i++)
									Trpg.invent.removeitem("BronzeBar");
								Trpg.invent.additem(item);
							}).setKilloncomp(true);
							timer.board = true;
							timer.wl = wl;
							Trpg.Home.add(timer,"Gameplay.currentaction");*/
							break;
					}
				}
				this.render = function(g){
					g.drawImage(Ast.i(this.ground),0,0);
					g.drawImage(Ast.i("anvil"),0,0);
				}
				return this;
			},
			Seedling:function(){
				this.type = "Seedling";
				this.avecolor = "#90D747";
				this.traits.walkable = true;
				var that = this;
				this.growtimer = new Utils.Timer(4).setAuto(true,function(){
					Trpg.board.setTile(new Trpg.Tile("Sapling"),that.wl);
				}).start();
				this.doaction = function(action){
					switch (action) {
						case "walkon":
							Trpg.board.setTile(new Trpg.Tile("DeadSeedling"),this.wl);
							break;
					}
				}
				this.update = function(d){
					this.growtimer.update(d);
				}
				this.render = function(g){
					g.drawImage(Ast.i(this.ground),0,0);
					g.drawImage(Ast.i("seedling"),0,0);
					this.growtimer.renderp(g);
				}
				return this;
			},
			DeadSeedling:function(){
				this.type = "DeadSeedling";
				this.actions = ["dig"];
				this.avecolor = "#90D747";
				this.traits.walkable = true;
				this.doaction = function(action){
					if (!exists(action))
						action = this.getActions()[0];
					var wl = this.wl;
					switch (action) {
						//case "walkon":
						//	Trpg.board.setTile(DeadSeedling.call(new Default()),this.wl);
						//	break;
						case "dig":
							var timer = new Utils.Timer(1).start().setAuto(true,function(){
								Trpg.board.setTile(new Trpg.Tile("Hole"),wl);
							}).setKilloncomp(true);
							timer.board = true;
							timer.wl = wl;
							Trpg.Home.add(timer,"Gameplay.currentaction");
							//Trpg.board.setTile(Hole.call(new Default()),this.wl);
							break;
					}
				}
				this.update = function(d){
					//this.growtimer.update(d);
				}
				this.render = function(g){
					g.drawImage(Ast.i(this.ground),0,0);
					g.drawImage(Ast.i("deadseedling"),0,0);
					//this.growtimer.render(g);
				}
				return this;
			},
			Sapling:function(){
				this.type = "Sapling";
				this.avecolor = "#2D6118";
				var that = this;
				this.growtimer = new Utils.Timer(7).setAuto(true,function(){
					Trpg.board.setTile(new Trpg.Tile("Tree"),that.wl);
				}).start();
				/*
				this.doaction = function(action){
					switch (action) {
						case "walkon":
							Trpg.board.setTile(DeadSeedling.call(new Default()),this.wl);
							break;
					}
				}
				this.getDelay = function(action){
					return 0;
					/*if (!exists(action))
						action = this.getActions()[0];
					if (!this.hasAction(action))
						return 0;
					switch (action){
						case "dig":		return 1.4;
						case "plant":	return 1;
						case "fill":	return .7;
						case "search":	return 1.5;
						case "apple":	return .9;
						default:		return 0;
					}*
				}
				this.loadChanges = function(changes){
				this.growtimer = new Utils.Timer(1).setAuto(true,function(){
					Trpg.board.setTile(Tree.call(new Default()),self.wl);
				}).start();
					this.setStage(changes.stage);
					return this;
				}
				this.getChanges = function(){
					return {stage:this.stage};
				}*/
				this.update = function(d){
					this.growtimer.update(d);
				}
				this.render = function(g){
					g.drawImage(Ast.i(this.ground),0,0);
					g.drawImage(Ast.i("sapling"),0,0);
					this.growtimer.renderp(g);
				}
				return this;
			},
			Tree:function(){
				this.type = "Tree";
				var hasseed = Math.random()<.3;
				this.actions = ["chop","search"];
				this.avecolor = "#2D6118";
				this.doaction = function(action){
					if (!exists(action))
						action = this.getActions()[0];
					var wl = this.wl;
					switch (action) {
						case "chop":
							var timer = new Utils.Timer(1.2).start().setAuto(true,function(){
								Trpg.board.setTile(new Trpg.Tile("Stump"),wl);
								Trpg.invent.additem(new Trpg.Item("Log"));
							}).setKilloncomp(true);
							timer.board = true;
							timer.wl = wl;
							Trpg.Home.add(timer,"Gameplay.currentaction");
							break;
						case "search":
							var timer = new Utils.Timer(.4).start().setAuto(true,function(){
								if (hasseed){
									Trpg.board.container.add(new feedback("You find a seed",
									Trpg.board.cloc.dx(wl)*32+16+Trpg.board.container.camera.x,
									Trpg.board.cloc.dy(wl)*32+Trpg.board.container.camera.y,1.5),"feedback");
									Trpg.invent.additem(new Trpg.Item("Seed"))
									hasseed = false;
								}
							}).setKilloncomp(true);
							timer.board = true;
							timer.wl = wl;
							Trpg.Home.add(timer,"Gameplay.currentaction");
							break;
					}
				}
				/*			this.getDelay = function(action){
					if (!exists(action))
						action = this.getActions()[0];
					if (!this.hasAction(action))
						return 0;
					switch (action){
						case "chop":	return 1.4;
						case "search":	return 1;
						default:		return 0;
					}
				}
				this.update = function(d){
					//this.growtimer.update(d);
				}*/
				this.render = function(g){
					g.drawImage(Ast.i(this.ground),0,0);
					g.drawImage(Ast.i("tree"),0,0);
					//console.log(Ast.i("tree"));
					//this.growtimer.render(g);
				}
				return this;
			},
			FireBig:function(){
				this.type = "FireBig";
				var that = this;
				this.avecolor = "#90D747";
				this.growtimer = new Utils.Timer(4).setAuto(true,function(){
					Trpg.board.setTile(new Trpg.Tile("FireSmall"),that.wl);
				}).start();
				this.update = function(d){
					this.growtimer.update(d);
				}
				/*
				this.doaction = function(action){
					if (!exists(action))
						action = this.getActions()[0];
					var wl = this.wl;
					switch (action) {
						case "dig":
							var timer = new Utils.Timer(1.4).start().setAuto(true,function(){
								Trpg.board.setTile(new Trpg.Tile("Hole"),wl);
							}).setKilloncomp(true);
							timer.board = true;
							timer.wl = wl;
							Trpg.Home.add(timer,"Gameplay.currentaction");
							break;
					}
				}*/
				this.render = function(g){
					g.drawImage(Ast.i(this.ground),0,0);
					g.drawImage(Ast.i("firebig"),0,0);
					this.growtimer.renderp(g);
				}
				return this;
			},
			FireSmall:function(){
				this.type = "FireSmall";
				var that = this;
				this.avecolor = "#90D747";
				this.growtimer = new Utils.Timer(3).setAuto(true,function(){
					Trpg.board.setTile(new Trpg.Tile("Grass"),that.wl);
					//drop ashes
				}).start();
				this.update = function(d){
					this.growtimer.update(d);
				}
				this.doaction = function(action){
					if (!exists(action))
						action = this.getActions()[0];
					var wl = this.wl.copy();
					switch (action) {
						case "fuel":
							//var timer = new Utils.Timer(1).start().setAuto(true,function
							/*	Trpg.board.container.add(new feedback("You add a log to the fire",
								Trpg.board.cloc.dx(wl)*32+16+Trpg.board.container.camera.x,
								Trpg.board.cloc.dy(wl)*32+Trpg.board.container.camera.y,1.5),"feedback");*/
								Trpg.board.setTile(new Trpg.Tile("FireBig"),wl);
							//	Trpg.invent.removeitem()
							// }).setKilloncomp(true);
							//timer.board = true;
							//timer.wl = wl;
							//Trpg.Home.add(timer,"Gameplay.currentaction");
							break;
					}
				}
				this.render = function(g){
					g.drawImage(Ast.i(this.ground),0,0);
					g.drawImage(Ast.i("firesmall"),0,0);
					this.growtimer.renderp(g);
				}
				return this;
			},
			Stump:function(){
				this.type = "Stump";
				this.avecolor = "#90D747";
				this.actions = ["dig"];
				this.traits.burnable = true;
				this.traits.walkable = true;
				this.doaction = function(action){
					if (!exists(action))
						action = this.getActions()[0];
					var wl = this.wl;
					switch (action) {
						case "dig":
							var timer = new Utils.Timer(1.4).start().setAuto(true,function(){
								Trpg.board.setTile(new Trpg.Tile("Hole"),wl);
							}).setKilloncomp(true);
							timer.board = true;
							timer.wl = wl;
							Trpg.Home.add(timer,"Gameplay.currentaction");
							break;
					}
				}
				/*this.getDelay = function(action){
					if (!exists(action))
						action = this.getActions()[0];
					if (!this.hasAction(action))
						return 0;
					switch (action){
						case "dig":		return 1.4;
						//case "plant":	return 1;
						//case "fill":	return .7;
						//case "search":	return 1.5;
						//case "apple":	return .9;
						default:		return 0;
					}
				}
				this.update = function(d){
					//this.growtimer.update(d);
				}*/
				this.render = function(g){
					g.drawImage(Ast.i(this.ground),0,0);
					g.drawImage(Ast.i("stump"),0,0);
					//this.growtimer.render(g);
				}
				return this;
			},
			CastleWall:function(){
				this.type = "CastleWall";
				this.avecolor = "#6F6F6F";
				this.render = function(g){
					var adjs = 
					(Trpg.board.getTile(this.wl.copy().shift(0,-1)).type == "CastleWall" ? "1" : "0")+
					(Trpg.board.getTile(this.wl.copy().shift(1,0)).type == "CastleWall" ? "1" : "0")+
					(Trpg.board.getTile(this.wl.copy().shift(0,1)).type == "CastleWall" ? "1" : "0")+
					(Trpg.board.getTile(this.wl.copy().shift(-1,0)).type == "CastleWall" ? "1" : "0");
					g.drawImage(Ast.i(this.ground),0,0);
					g.save();
					g.translate(16,16);
					switch (adjs){
						case "0000":	g.drawImage(Ast.i("cwallc"),-16,-16);	break;
						case "1111":	g.drawImage(Ast.i("cwallx"),-16,-16);	break;
						case "0001":	g.rotate(Math.PI/2);
						case "0010":	g.rotate(Math.PI/2);
						case "0100":	g.rotate(Math.PI/2);
						case "1000":	g.drawImage(Ast.i("cwallu"),-16,-16);	break;
						case "1001":	g.rotate(Math.PI/2);
						case "0011":	g.rotate(Math.PI/2);
						case "0110":	g.rotate(Math.PI/2);
						case "1100":	g.drawImage(Ast.i("cwalll"),-16,-16);	break;
						case "0101":	g.rotate(Math.PI/2);
						case "1010":	g.drawImage(Ast.i("cwallv"),-16,-16);	break;
						case "1110":	g.rotate(Math.PI/2);
						case "1101":	g.rotate(Math.PI/2);
						case "1011":	g.rotate(Math.PI/2);
						case "0111":	g.drawImage(Ast.i("cwallt"),-16,-16);	break;
					}
					g.restore();
				}
				return this;
			},
			Chest:function(){
				this.type = "Chest";
				var that = this;
				this.avecolor = "#EFC700";
				this.actions = ["open","deposit"];
				this.openimg = "bronzechestO";
				this.closeimg = "bronzechestC";
				this.traits.walkable = true;
				this.contents = {items:[]};
				this.getstate = function(){return JSON.stringify(this.contents)}
				this.additem = function(item){
					if (item.stackable){
						for (var i = 0; i < this.contents.items.length; i++)
							if (this.contents.items[i].type == item.type){// } && this.contents.items[i].stackable){
								this.contents.items[i].amt+=item.amt;
								this.makemenu();
								return this;
							}
					}
					this.contents.items.push(item.copy());
					this.makemenu();
					return this;
				}
				/*this.setinfinite = function(inf){
					this.infinite = inf;
					return this;
				}*/
				this.setcontents = function(contents){
					this.contents = contents;
					this.empty = false;
					return this;
				}
				this.newcontents = function(){
					var items = [];
					for (var i = 0; i < Math.random()*2+1; i++)
						(function(){
							var rng = Math.random();
							//if (rng<.05)
							//	items.push(new Trpg.Item("Gold").setamt(Math.random()*500+500));
							//else if (rng < .4)
							//	items.push(new Trpg.Item("Gold").setamt(Math.random()*50));
							//else 
								if (rng < .4)
								items.push(new Trpg.Item("Bronze"+(["Dagger","Helm","Kite","Legs","Body"][Math.floor(Math.random()*5)])));
							else if (rng < .7)
								for (var j = 0; j < Math.random()*4; j++)
									items.push(new Trpg.Item("BronzeBar"));
							else
								for (var j = 0; j < Math.random()*3; j++)	
									items.push(new Trpg.Item(["TinOre","CopperOre"][Math.floor(Math.random()*2)]));
							/*else 
								for (var j)
							else if (rng < .8)
								for (var j = 0; j < Math.random()*3; j++)	items.push(new Trpg.Item("Tin"));
							else 
								for (var j = 0; j < Math.random()*3; j++)	items.push(new Trpg.Item("Copper"));
								*/
						})();
					this.empty = false;
					this.contents = {
						items:items
					};
					return this;
				}
				//this.empty = true;
				//this.newcontents();
				this.makemenu = function(){
					var that = this;
					if (!exists(that.menu))
						that.menu = new BoardMenu(that.wl);
					that.menu.removeall();
					//that.menu.onempty = function(){that.empty = true}
					var items = that.contents.items;
					that.menu.setheader(this.type,"white");
					for (var i = 0; i < items.length; i++){
						var text = (items[i].stackable?(amt2text(items[i].amt)+" "):"")+items[i].type;
						if (items[i].amt > 0)
						that.menu.additem((function(a){return function(){
							if (Trpg.invent.getempty() == 0){
								//that.menu.container.remove(that.menu);
								Trpg.board.container.add(new feedback("Not enough room",
								Trpg.board.cloc.dx(that.wl)*32+16+Trpg.board.container.camera.x,
								Trpg.board.cloc.dy(that.wl)*32+Trpg.board.container.camera.y,1.5),"feedback");
								return "close";
							}
						//	console.log(a);
							//new Trpg.Item(a.type)
							//var btn = that.menu.get("item"+(that.menu.itemcount-))
							if (!a.ostackable){
								if (a.amt>0)
								Trpg.invent.additem(new Trpg.Item(a.type));
							//console.log(that);
								a.amt--;
								if (a.amt <= 0){
									items.splice(items.indexOf(a),1);
									that.makemenu();
									return;
								}
								else return that.makemenu();
							}
							Trpg.invent.additem(new Trpg.Item(a.type),a.amt);
							items.splice(items.indexOf(a),1);
						//	txt = a.type + (a.stackable?(" "+amt2text(a.amt)):"");
						//	console.log(txt);
						that.makemenu();
						
							return "remove"; 
							//if (exists(item.ostackable) && item.ostackable)
							Trpg.invent.additem(new Trpg.Item(a.type),a.amt);//,a.amt);
							if (!exists(a.infinite) || !a.infinite){
								
								items.splice(items.indexOf(a),1);
								if (items.length == 0)
									return "close";
								return "remove";
							} //else return;
							return "remove";
						};})(items[i]),text,"orange");
					}
				}
				this.doaction = function(action){
					if (!exists(action))	action = this.getActions()[0];
					var wl = this.wl;
					var that = this;
					switch (action){
						case "open":
							if (this.contents.items.length == 0){
								Trpg.board.container.add(new feedback("The chest is empty",
								Trpg.board.cloc.dx(wl)*32+16+Trpg.board.container.camera.x,
								Trpg.board.cloc.dy(wl)*32+Trpg.board.container.camera.y,1.5),"feedback");
								return;
							}
							//if (!exists(that.menu))
								this.makemenu();
							that.menu.open();
							break;
						case "deposit":
							if (Trpg.invent.getempty() == 35){//.items.length == 0){
								Trpg.board.container.add(new feedback("You have nothing to deposit",
								Trpg.board.cloc.dx(wl)*32+16+Trpg.board.container.camera.x,
								Trpg.board.cloc.dy(wl)*32+Trpg.board.container.camera.y,1.5),"feedback");
								return;
							}
							Trpg.invent.withdrawing = this;
							this.actions = ["cancel"];
							break;
						case "cancel":
							this.invent.withdrawing = -1;
							this.actions = ["open","deposit"];
							break;
					}
				}
				this.getwithdraw = function(item,menu){
					//console.log("er4tg5hyju7ki8o");
					//console.log(item);
					menu.additem(function(){
						if (item !== "empty")
							that.deposit(item);
					},"Deposit","white");
				}
				this.deposit = function(item){
					//console.log("fed");
					//console.log(item);
					this.additem(item);
					Trpg.invent.removeitem(item,item.amt);
					//this.contents.items.push(item);
				}
				this.load = function(save){
					this.ground = save.ground;
					save.wl = JSON.parse(save.wl);
					this.wl = new Trpg.WorldLoc(save.wl.wx, save.wl.wy, save.wl.cx, save.wl.cy);
					var items = [];
					//this.contents = {}
					var contents = JSON.parse(save.contents);
					for (var i = 0; i < contents.items.length; i++)
						items.push(new Trpg.Item(contents.items[i].type).sets({infinite:contents.items[i].infinite,amt:contents.items[i].amt}));//setinfinite(contents.items[i].infinite));
					this.setcontents({items:items});
					this.makemenu();
				//	console.log(this.menu);
					//this.empty = JSON.parse(save.empty);
					//new Trpg.WorldLoc().load(JSON.parse(save.dest));
				}
				this.save = function(){
					return {
						type:this.type,
						wl:JSON.stringify(this.wl.copy()),
						ground:this.ground,
						contents:JSON.stringify(this.contents),
						count:0,//exists(this.growtimer) ? this.growtimer.count : 0
						empty:JSON.stringify(this.contents.items.length == 0)
					}
				}
				this.render = function(g){
					if (this.contents.items.length == 0)
						this.actions = ["deposit"];
					else this.actions = ["open","deposit"];
					//g.fillStyle = "yellow";
					if (exists(this.menu) && this.menu.container!==-1)this.menu.adjwidths(g);
					g.drawImage(Ast.i(this.ground),0,0);
					g.drawImage(Ast.i(this.contents.items.length == 0 ? this.openimg : this.closeimg),0,0);
					//var text = this.empty ? "Empty" : "Chest";
					//Drw.drawCText(g,text,16,16);
					//g.fillText("Chest",)
					//g.drawImage(Ast.i("dirt"),0,0);
				}
				return this;
			},
			BankChest:function(){
				tiles.Chest.call(this);
				this.type = "BankChest";
				this.openimg = "bankchestO";
				this.closeimg = "bankchestC";
				if (!exists(Trpg.bank))
					(Trpg.bank = {contents:{items:[]}});
				this.setcontents(Trpg.bank.contents);
				this.getstate = function(){return JSON.stringify(Trpg.bank.contents);}
				this.additem = function(item){
					
					item = item.copy();
					item.ostackable = item.stackable;
					item.stackable = true;
					for (var i = 0; i < this.contents.items.length; i++)
						if (this.contents.items[i].type == item.type){// } && this.contents.items[i].stackable){
							this.contents.items[i].amt+=item.amt;
							this.makemenu();
							return this;
						}
					Trpg.bank.contents.items.push(item);
					this.setcontents((Trpg.bank && Trpg.bank.contents)||{items:[]});
					this.makemenu();
					return this;
				}
				return this;
			},
			Dirt:function(){
				this.type = "Dirt";
				this.avecolor = "#663B16";
				this.actions = ["dig"];
				//if (Math.random() < .01) return new Trpg.Tile("Chest");
				//else return new Trpg.Tile("StoneFloor");
				this.chest = Math.random() < .05 ? new Trpg.Tile("Chest").newcontents() : -1;
				//this.traits.burnable = true;
				//this.traits.walkable = true;
				var that = this;
				this.forcetimer = new Utils.Timer(.5).setAuto(true,function(){
								if (that.chest !== -1)
									Trpg.board.setTile(that.chest,that.wl);
								else 
									Trpg.board.setTile(new Trpg.Tile("Stone"),that.wl);
							});
				this.doaction = function(action){
					if (!exists(action))	action = this.getActions()[0];
					var wl = this.wl;
					switch (action){
						case "walkon":
							this.forcing = true;
							if (!this.forcetimer.running)
								this.forcetimer.start();
							break;
						case "dig":
							if (!(Trpg.board.getTile(wl.copy().shift(0,1)).traits.walkable
							  ||Trpg.board.getTile(wl.copy().shift(0,-1)).traits.walkable
							  ||Trpg.board.getTile(wl.copy().shift(1,0)).traits.walkable
							  ||Trpg.board.getTile(wl.copy().shift(-1,0)).traits.walkable))
							  break;
						if (Trpg.Home.get("Gameplay").has("currentaction")) return;
							var timer = new Utils.Timer(.4).start().setAuto(true,function(){
								if (that.chest !== -1)
									Trpg.board.setTile(that.chest,wl);
								else 
									Trpg.board.setTile(new Trpg.Tile("Stone"),wl);
							}).setKilloncomp(true);
							timer.board = true;
							timer.wl = wl;
							Trpg.Home.add(timer,"Gameplay.currentaction");
							break;
					}
				}
				this.update = function(d){
					if (this.forcing)	this.forcetimer.update(d);
					else this.forcetimer.count = 0;
					this.forcing = false;
					
				}
				this.render = function(g){
					g.drawImage(Ast.i("dirt"),0,0);
					this.forcetimer.renderp(g);
				}
				return this;
			},
			Floor:function(type){
				this.type = type;
				this.avecolor = "#8A8A8A";
				this.traits.walkable = true;
				this.render = function(g){
					g.drawImage(Ast.i(this.type.toLowerCase()),0,0);
				}
				return this;
			},
			Stone:function(){
				return tiles.Floor.call(this,"Stone");
			},
			//{ores
			Ore:function(type,avecol){
				this.type = type+"Ore";
				this.actions = ["dig"];
				this.avecolor = avecol;
				this.item = this.type;
				switch (type){
					case "Tin":
					case "Copper":	this.digrate = 1;	break;
					case "Iron":	this.digrate = 2;	break;
					case "Coal":	this.digrate = 3;	break;
					case "Mithril":	this.digrate = 5;	break;
					case "Adamant":	this.digrate = 8;	break;
					case "Runite":	this.digrate = 13;	break;
					case "Eternium":this.digrate = 21;	break;
				}
				this.getdefground = function(wl){
					switch (wl.dim){
						case "underground1":	return "dirt";
						case "underground2":	return "dirt";
						case "underground3":	return "dirt";
						case "underground4":	return "dirt";
					}
				}
				var that = this;
				this.forcetimer = new Utils.Timer(this.digrate).setAuto(true,function(){
								Trpg.board.setTile(new Trpg.Tile("Stone"),that.wl);
								Trpg.invent.additem(new Trpg.Item(that.item));
							});
				this.doaction = function(action){
					if (!exists(action))	action = this.getActions()[0];
					var wl = this.wl;
					var that = this;
					switch (action){
						case "walkon":
							this.forcing = true;
							if (!this.forcetimer.running)
								this.forcetimer.start();
							break;
						case "dig":
							var adjs = wl.getadjs();
							var reachable = false;
							for (var i = 0; i < adjs.length; i++)
								if (Trpg.board.getTile(adjs[i]).traits.walkable)
									reachable = true;
							if (!reachable)	break;
							var timer = new Utils.Timer(that.digrate).start().setAuto(true,function(){
								if (Trpg.invent.getempty() == 0){
									Trpg.board.container.add(new feedback("Not enough room",
									Trpg.board.cloc.dx(wl)*32+16+Trpg.board.container.camera.x,
									Trpg.board.cloc.dy(wl)*32+Trpg.board.container.camera.y,1.5),"feedback");
									return;
								}
								switch(wl.dim){
									case "underground1":	Trpg.board.setTile(new Trpg.Tile("Stone").sets({traits:{walkable:true}}),wl);	break;
									//case "underground1":	Trpg.board.setTile(new Trpg.Tile("StoneFloor"),wl);	break;
								}
								Trpg.invent.additem(new Trpg.Item(that.item));
							}).setKilloncomp(true);
							timer.board = true;
							timer.wl = wl;
							Trpg.Home.add(timer,"Gameplay.currentaction");
							break;
					}
				}
				this.update = function(d){
					if (this.forcing){
						if (Trpg.invent.getempty() == 0){
							Trpg.board.container.add(new feedback("Not enough room",
							Trpg.board.cloc.dx(that.wl)*32+16+Trpg.board.container.camera.x,
							Trpg.board.cloc.dy(that.wl)*32+Trpg.board.container.camera.y,1.5),"feedback");
						} else this.forcetimer.update(d);
					}
					else this.forcetimer.count = 0;
					this.forcing = false;
					
				}
				this.render = function(g){
					g.drawImage(Ast.i(this.ground),0,0);
					//g.drawImage(Ast.i("eternium"+"ore"),0,0);
					g.drawImage(Ast.i(this.item.toLowerCase()),0,0);
					this.forcetimer.renderp(g);
				}
				return this;
			},
			TinOre:function(){		return tiles.Ore.call(this,"Tin","#808080");		},
			CopperOre:function(){	return tiles.Ore.call(this,"Copper","#C57339");	},
			CoalOre:function(){		return tiles.Ore.call(this,"Coal","#4B4B4B");		},
			IronOre:function(){		return tiles.Ore.call(this,"Iron","#954C33");		},
			MithrilOre:function(){	return tiles.Ore.call(this,"Mithril","#000000");	},
			AdamantOre:function(){	return tiles.Ore.call(this,"Adamant","#000000");	},
			RuniteOre:function(){	return tiles.Ore.call(this,"Runite","#000000");	},
			EterniumOre:function(){	return tiles.Ore.call(this,"Eternium","#CAE4B7");	},//}
		}
		return tiles[type].apply(new Default());
	}
	this.Chunk = function(x,y,d){
		this.wl = new Trpg.WorldLoc(x,y,0,0,d);
		this.generate = function(){
			this.code = "x"+x+"y"+y+"d"+d;
			Math.seedrandom(Trpg.world.wseed+this.code);
			this.tiles = [];
			this.origtiles = [];
			switch (d){
				case "surface":
					for (var i = 0; i < 8; i++){
						var row = [];
						var orow = [];
						for (var j = 0; j < 8; j++){
							var t = (function(){
								var r = Math.random();
								//if (r<.002)
								//	return new Trpg.Tile("AlchingStand");
								//else 
									if (r<.1)
									return new Trpg.Tile("Tree");
								else return new Trpg.Tile("Grass");
							})().setWl(this.wl.copy().shift(j,i));
							//var t = generateTile(Math.random()).setWl(this.wl.copy().shift(j,i));
							row.push(t);
							orow.push(t);
						}
						this.tiles.push(row);
						this.origtiles.push(orow);
					}
					break;
				case "floor1":
				case "floor2":
					for (var i = 0; i < 8; i++){
						var row = [];
						var orow = [];
						for (var j = 0; j < 8; j++){
							var t = new Trpg.Tile("Void").setWl(this.wl.copy().shift(j,i));
							//var t = generateTile(Math.random()).setWl(this.wl.copy().shift(j,i));
							row.push(t);
							orow.push(t);
						}
						this.tiles.push(row);
						this.origtiles.push(orow);
					}
					break;
				case "underground1":
				case "underground2":
					for (var i = 0; i < 8; i++){
						var row = [];
						var orow = [];
						for (var j = 0; j < 8; j++){
							var t = new Trpg.Tile("Dirt").setWl(this.wl.copy().shift(j,i));
							row.push(t);
							orow.push(t);
						}
						this.tiles.push(row);
						this.origtiles.push(orow);
					}
					if (Math.random()<.5){
						var amt = Math.floor(Math.random()*5+5);
						for (var i = 0; i < amt; i++){
							var type = ["TinOre","CopperOre","CoalOre","IronOre","MithrilOre","AdamantOre","RuniteOre","EterniumOre"][Math.floor(Math.random()*8)];
							var tx = Math.floor(Math.random()*8);
							var ty = Math.floor(Math.random()*8);
							this.tiles[tx][ty] = new Trpg.Tile(type).setWl(this.wl.copy().shift(ty,tx));;
							this.origtiles[tx][ty] = new Trpg.Tile(type).setWl(this.wl.copy().shift(ty,tx));;
						}
					}
					break;
			}
			if (Trpg.world.changed.indexOf(this.code)!=-1)
				this.loadChanges();
			for (var i = 0; i < 8; i++)
				for (var j = 0; j < 8; j++)
					Trpg.Map.addtile(this.tiles[j][i]);
			return this;
		}
		this.renderimg = function(g){
			var s = 3;
			for (var i = 0; i < 8; i++)
				for (var j = 0; j < 8; j++){
					g.fillStyle = this.tiles[j][i].getcolor();
					g.fillRect(s*i,s*j,s,s);
				}
		}
		this.getimg = function(){
			var c=document.createElement("canvas");
			var ctx=c.getContext("2d");
			//var imgData=ctx.createImageData(8,8);
			//for (var i=0;i<imgData.data.length;i+=4)
			//	{
			//	imgData.data[i+0]=255;
			//	imgData.data[i+1]=0;
			//	imgData.data[i+2]=0;
			//	imgData.data[i+3]=255;
			//	}
			//ctx.putImageData(imgData,10,10);
			return ctx;
		}
		this.getTile = function(wl){
			return this.tiles[wl.cy][wl.cx];
		}
		this.setTile = function(tile, wl){
			this.tiles[wl.cy][wl.cx] = tile.setWl(wl.copy());
			Trpg.Map.addtile(tile);
		}
		this.loadChanges = function(){
			var changes = Trpg.world.changes[this.code] && JSON.parse(Trpg.world.changes[this.code]) || [];
			for (var i = 0; i < changes.length; i++){
				this.tiles[changes[i].i][changes[i].j] = new Trpg.Tile(changes[i].save.type).setWl(this.wl.copy().shift(changes[i].j,changes[i].i));
				this.tiles[changes[i].i][changes[i].j].load(changes[i].save);
				Trpg.Map.addtile(this.tiles[changes[i].i][changes[i].j]);
				//this.tiles[changes[i].i][changes[i].j].update(changes[i].count);
			}
		}
		this.getChanges = function(){
			var changes = [];
			for (var i = 0; i < 8; i++)
				for (var j = 0; j < 8; j++)
					if (this.tiles[i][j].getstate()!=this.origtiles[i][j].getstate())
						changes.push({i:i,j:j,save:this.tiles[i][j].save()})
						//if (exists(this.tiles[i][j].growtimer))
						//	 changes.push({i:i,j:j,type:this.tiles[i][j].type,count:this.tiles[i][j].growtimer.count});
						//else changes.push({i:i,j:j,type:this.tiles[i][j].type,count:0});
			if (changes.length == 0)
				return "none";
			if (Trpg.world.changed.indexOf(this.code)==-1)
				Trpg.world.changed.push(this.code);
			return (JSON.stringify(changes));
		}
		this.update = function(d){
			for (var i = 0; i < 8; i++)
				for (var j = 0; j < 8; j++)
					this.tiles[i][j].update(d);
		}
		this.render = function(g){
			g.translate(32*(8*x-0*Trpg.board.cloc.cx),32*8*y);
			for (var i = 0, wl; i < 8; i++){
				for (var j = 0; j < 8; j++){
					wl = new Trpg.WorldLoc(x,y,j,i,d);
					
					if (Trpg.board.cloc.dist(wl) < Trpg.board.viewsize)
						this.tiles[i][j].render(g);
					
					if (Trpg.board.onboard && Trpg.board.aim!=-1 && exists(Trpg.board.aim))
						if (Trpg.board.aim.dist(wl)==0)
							g.strokeRect(0,0,32,32);
						
					if (Trpg.board.ground.hasitems(wl))
						Trpg.board.ground.render(g,wl);
						
					if (Trpg.Home.get("Gameplay").has("currentaction")
						&& Trpg.Home.get("Gameplay.currentaction").board
						&& Trpg.Home.get("Gameplay.currentaction").wl.dist(wl) == 0)
						Trpg.Home.get("Gameplay.currentaction").renderp(g);
					
					if (false&&Trpg.toolbox.container.has("actiondelay")
						&& Trpg.toolbox.actingwl !== -1
						&& Trpg.toolbox.actingwl.dist(wl) == 0 
						&& Trpg.toolbox.container.get("actiondelay").progress()<1)
						Trpg.toolbox.container.get("actiondelay").renderp(g);
						
					g.translate(32,0);
				}
				g.translate(-8*32,32);
			}
		}
	}
}