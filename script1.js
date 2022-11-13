function Scene(screen, controls) {
    this.canvas = screen.canvas;
    this.ctx = this.canvas.getContext("2d");
    this.controls = controls;
    this.imgs = screen.imgs;
}

function Lib(screen, controls) {
    Scene.apply(this, arguments);
    this.assets = [
        // player-sceleton
        {name: "player", path: "assets/player.png"}, 
        // enemies
        {name: "orc", path: "assets/orc.png"},
        {name: "dragon", path: "assets/dragon.png"},
        // graphics
        {name: "bg", path: "assets/tiles.png"},
        {name: "title", path: "assets/interface/menu.png"},
        {name: "soundOn", path: "assets/interface/soundOn.png"},
        {name: "soundOff", path: "assets/interface/soundOff.png"},
        {name: "settings", path: "assets/interface/settings.png"},
        {name: "support", path: "assets/interface/tg.png"}
    ];

    this.total = this.assets.length;
    this.loaded = 0;
    this.status = "loading";
    this.loaded_at = 0;

    
    // добавляем src ко всем файликам из assets
    var self = this;
    for(var i=0; i < this.total; i++) {
        var img = new Image();
        img.onload = function() {
            self.loaded++;
        };
        img.src = self.assets[i].path;
        screen.imgs[self.assets[i].name] = img;

    }
}
Lib.prototype = Object.create(Scene.prototype);
Lib.prototype.constructor = Lib;

Lib.prototype.render = function (time) {
    if(this.status == "loading") {
        if(this.loaded == this.total) {
            this.status = "loaded";
            this.loaded_at = time;
        }
        this.ctx.fillStyle = "#25131a";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = "#fff";
        this.ctx.font="50px courier";
        this.ctx.fillText("Loading " + this.loaded + "/" + this.total,this.canvas.width / 3 - 50,this.canvas.height/2 - 10);
        return "lib";
    }
    
    if(this.status == "loaded") {
        if((time - this.loaded_at) > 1000) {
            return "menu";
        } else {
            return "lib";
        }
    };
}


var buttons = {
    // scene menu:
    start: {
        x: 305,
        y: 347,
        w: 270,
        h: 80,
        isStart: true,
    },
    exit: {
        x: 305,
        y: 467,
        w: 270,
        h: 80,
    },
    soundBtn: {
        x: 140,
        y: 430,
        w: 90,
        h: 90,
        soundOn: true,
        isSoundOn: true,
    },
    settingsMenuBtn: {
        x: 25,
        y: 530,
        w: 90,
        h: 90,
    },
    settingsMenu: {
        x: 100,
        y: 100,
        w: 450,
        h: 450,
        open: false,
        close: true
    },
    settingsGame: {
        x: 100,
        y: 100,
        w: 450,
        h: 450,
        open: false,
        close: true,
        isGameScene: true,
    },
    tgBtn: {
        x: 25,
        y: 435,
        w: 100,
        h: 100,
    },
    // scene game:
    settingsGameBtn: {
        x: 530,
        y: 25,
        w: 90,
        h: 90,
    },

    // scene win or lose
    tryAgainBtn: {
        x: 236,
        y: 520,
        w: 180,
        h: 48, 
        show: false,
    },
};

var texts = {
    menuControl0: {
        font: "25px courier",
        color: "#fff",
        x: 190,
    },
    intrigueSora: {
        font: "10px courier",
        color: "#fff",
        x: 290,
    }, 
    menuControl1: {
        font: "25px courier",
        color: "#fff",
        x: 190,
    },
}

function Menu(screen, controls) {
    Scene.apply(this, arguments);
}
Menu.prototype = Object.create(Scene.prototype);
Menu.prototype.constructor = Menu;

// долго думал куда засунуть в итоге засунул сюда
function settings(ctx) {
    ctx.fillStyle = texts.menuControl0.color;
    ctx.font = texts.menuControl0.font;
    ctx.fillText("w     -     forward", texts.menuControl0.x, 170);
    ctx.fillText("a     -     left", texts.menuControl0.x, 215);
    ctx.fillText("s     -     back", texts.menuControl0.x, 260);
    ctx.fillText("d     -     right", texts.menuControl0.x, 305);
    ctx.fillText("space  -     attack", texts.menuControl0.x -15, 350);
    ctx.fillText("created by", texts.intrigueSora.x, 460);
    ctx.fillText("intrigue.sora", texts.intrigueSora.x, 505);
}

Menu.prototype.render = function(time) {
    
    if(buttons.settingsMenu.open) {
        buttons.settingsMenu.close = false;
        this.ctx.fillStyle = "#25131a";
        this.ctx.fillRect(buttons.settingsMenu.x, buttons.settingsMenu.y,
                          buttons.settingsMenu.w, buttons.settingsMenu.h);

        // soundOn and soundOff
        if(buttons.soundBtn.isSoundOn) {
            this.ctx.drawImage(this.imgs["soundOn"],
                                buttons.soundBtn.x, buttons.soundBtn.y, 
                                buttons.soundBtn.w, buttons.soundBtn.h);

        } else {
            this.ctx.drawImage(this.imgs["soundOff"],
                                buttons.soundBtn.x, buttons.soundBtn.y, 
                                buttons.soundBtn.w, buttons.soundBtn.h);
        }

        settings(this.ctx);
        

    } else {
        buttons.settingsMenu.close = true;
        // background
        this.ctx.drawImage(this.imgs["title"],
                       0,0,650,650);
        
        
        this.ctx.drawImage(this.imgs["settings"],
                                buttons.settingsMenuBtn.x, buttons.settingsMenuBtn.y, 
                                buttons.settingsMenuBtn.w, buttons.settingsMenuBtn.h);

        this.ctx.drawImage(this.imgs["support"],
                                buttons.tgBtn.x, buttons.tgBtn.y, 
                                buttons.tgBtn.w, buttons.tgBtn.h);
    }
    
    if(this.controls.states["startClick"]) {
        return "game";
    } else {
        return "menu";
    }
    
};

// очень важные переменные, прям капец важные пожалуйста не трогать 
gameVariables = {
    kill: false,
    bossDead: false,
    playerDead: false,
    change: false,
    walkable: false,
    sounds: {},
};
gameVariables.sounds["arrow"] = new Sound("assets/sounds/arrow.mp3");
gameVariables.sounds["monster_death"] = new Sound("assets/sounds/monster_death.mp3");
gameVariables.sounds["click"] = new Sound("assets/sounds/click.mp3");
gameVariables.sounds["bg"] = new Sound("assets/sounds/sound.mp3");
gameVariables.sounds["boss_fight"] = new Sound("assets/sounds/boss_fight.mp3");


function Game(screen, controls) {
    this.controls = controls;
    Scene.apply(this, arguments);

    this.camera = new Camera(0,0,this);
    this.player = new Player(140,132,this);

    this.monster = new Player(480,170,this);
    this.monster.type = "monster";
	this.monster.status = "walking";

    this.monster1 = new Player(120,600,this);
    this.monster1.type = "monster";
	this.monster1.status = "walking";

    this.monster2 = new Player(980,170,this);
    this.monster2.type = "monster";
	this.monster2.status = "walking";

    this.monster3 = new Player(980,210,this);
    this.monster3.type = "monster";
	this.monster3.status = "walking";

    this.monster4 = new Player(980,270,this);
    this.monster4.type = "monster";
	this.monster4.status = "walking";

    this.boss = new Player(489,750,this);
    this.boss.type = "boss";
	this.boss.status = "walking";

    this.forEnd = new Player(140,132,this);
    this.forEnd.type = "forEnd";
	this.forEnd.status = "walking";

 
    this.map = [
        [39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,0 ,2 ,5 ,3 ,2 ,2 ,5 ,3 ,10,39],
        [0 ,2 ,5 ,3 ,2 ,2 ,8 ,9 ,3 ,2 ,4 ,2 ,2 ,10,39,1 ,24,13,14,13,13,14,27,11,39],
        [1 ,12,13,25,13,15,2 ,2 ,12,13,14,13,15,11,39,37,16,17,18,17,45,18,19,38,39],
        [37,16,17,18,17,18,13,14,18,17,18,44,19,3 ,2 ,2 ,43,44,18,44,18,17,19,11,39],
        [1 ,29,21,22,21,23,35,36,43,44,18,44,18,13,14,14,18,44,17,18,17,18,42,38,39],
        [33,40,41,40,41,40,34,1 ,28,22,18,18,23,35,40,36,16,44,18,18,17,18,19,11,39],
        [39,39,39,39,39,39,39,33,40,36,16,19,35,34,39,37,20,22,18,18,22,21,30,38,39],
        [39,39,39,39,39,39,39,39,39,37,16,19,38,39,39,33,40,36,16,19,35,41,40,34,39],
        [39,39,39,39,39,39,39,39,39,1 ,16,42,11,39,39,39,39,37,16,19,38,39,39,39,39],
        [39,0 ,3 ,2 ,4 ,2 ,2 ,10,39,37,16,19,3 ,2 ,4 ,3 ,5 ,3 ,16,42,11,39,39,39,39],
        [39,1 ,12,13,14,13,27,11,39,1 ,16,44,13,14,14,13,14,14,21,23,38,39,39,39,39],
        [39,37,16,17,18,17,19,3 ,2 ,2 ,16,19,35,40,41,36,43,19,35,40,34,39,39,39,39], 
        [39,1 ,43,44,18,44,18,13,14,14,18,42,11,39,39,1 ,29,30,38,39,39,39,39,39,39],
        [39,1 ,28,44,18,18,23,35,40,36,6 ,7 ,38,39,39,33,40,40,34,39,39,39,39,39,39],
        [39,33,40,36,43,19,35,34,39,37,16,19,11,39,39,39,39,39,39,39,39,39,39,39,39],
        [39,39,39,1 ,29,30,38,39,0 ,3 ,6 ,7 ,2 ,2 ,5 ,2 ,10,39,39,39,39,39,39,39,39],
        [39,39,39,33,40,40,34,39,1 ,12,44,44,13,14,13,15,11,39,39,39,39,39,39,39,39],
        [39,39,39,39,39,39,39,39,37,16,17,18,17,18,17,19,38,39,39,39,39,39,39,39,39],
        [39,39,39,39,39,39,39,39,1 ,43,44,18,45,18,44,19,11,39,39,39,39,39,39,39,39],
        [39,39,39,39,39,39,39,39,1 ,28,22,21,22,22,21,23,11,39,39,39,39,39,39,39,39],
        [39,39,39,39,39,39,39,39,33,40,41,40,41,40,41,40,34,39,39,39,39,39,39,39,39],
        [39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39],      
    ];

    this.tiles = [
        {j:0,i:0,walk: false}, // 0 - left-wall for  angle
        {j:0,i:1,walk: false}, // 1 - left-wall 1block
        {j:1,i:0,walk: false}, // 2 - wall
        {j:2,i:0,walk: false}, // 3 - wall-blacked
        {j:3,i:0,walk: false}, // 4 - wall flag
        {j:4,i:0,walk: false}, // 5 - wall torch
        {j:5,i:0,walk: false}, // 6 - left door
        {j:6,i:0,walk: false}, // 7 - right door
        {j:0,i:2,walk: false}, // 8 - right tunnel wall
        {j:0,i:3,walk: false}, // 9 - left tunnel wall
        {j:2,i:5,walk: false}, // 10 - left-wall 2block angle
        {j:3,i:5,walk: false}, // 11 - left-wall 1block
        {j:1,i:1,walk: true},  // 12 - floor top-left
        {j:2,i:1,walk: true},  // 13 - floor top
        {j:3,i:1,walk: true},  // 14 - floor top2
        {j:4,i:1,walk: true},  // 15 - floor top-right
        {j:1,i:2,walk: true},  // 16 - floor left
        {j:2,i:2,walk: true},  // 17 - floor
        {j:3,i:2,walk: true},  // 18 - floor2   
        {j:4,i:2,walk: true},  // 19 - floor right
        {j:1,i:3,walk: true},  // 20 - floor bottom-left
        {j:2,i:3,walk: true},  // 21 - floor bottom
        {j:3,i:3,walk: true},  // 22 - floor bottom2
        {j:4,i:3,walk: true},  // 23 - floor bottom-right
        {j:5,i:1,walk: true},  // 24 - floor top-left corpse
        {j:6,i:1,walk: true},  // 25 - floor top corpse
        {j:7,i:1,walk: true},  // 26 - floor top-right corpse
        {j:8,i:1,walk: true},  // 27 - floor top-right spiderweb
        {j:5,i:2,walk: true},  // 28 - floor bottom-left corpse
        {j:6,i:2,walk: true},  // 29 - floor bottom-left spiderweb
        {j:8,i:2,walk: true},  // 30 - floor bottom-right corpse
        {j:0,i:4,walk: false}, // 31 - wall up-right
        {j:1,i:4,walk: false}, // 32 - wall up-left
        {j:2,i:4,walk: false}, // 33 - wall 1block-left
        {j:3,i:4,walk: false}, // 34 - wall 1block-right
        {j:0,i:5,walk: false}, // 35 - wall up-right tunnel
        {j:1,i:5,walk: false}, // 36 - wall up-left tunnel
        {j:4,i:4,walk: false}, // 37 - wall left 2block no angle
        {j:4,i:5,walk: false}, // 38 - wall right 2block no angle
        {j:7,i:2,walk: false}, // 39 - empty
        {j:5,i:3,walk: false}, // 40 - wall behind 1block
        {j:6,i:3,walk: false}, // 41 - wall behind 2block
        {j:7,i:3,walk: true},  // 42 - floor right torch
        {j:8,i:3,walk: true},  // 43 - floor left torch
        {j:5,i:4,walk: true},  // 44 - floor3
        {j:7,i:0,walk: true},  // 44 - wall right for angle
        {j:6,i:4,walk: true},  // 45 - floor 3skeleton
    ];
   
    this.arrows = [];
}

Game.prototype = Object.create(Scene.prototype);
Game.prototype = Object.create(Controls.prototype);
Game.prototype.constructor = Game;

Game.prototype.render_bg = function (time) {
    if (gameVariables.kill) {
        this.tiles[6] = {j:1,i:2,walk: true};
        this.tiles[7] = {j:4,i:2,walk: true}
    } else {}

    var start_col = Math.floor(this.camera.x / 48);
    var start_row = Math.floor(this.camera.y / 48);

    for(var i = start_row; i < (start_row + 25); i++) {
        for(var j = start_col; j < (start_col + 22); j++) {
            if(( j < 25) && (i < 22)) {
                var tile = this.tiles[this.map[i][j]];
                  this.ctx.drawImage(this.imgs["bg"],
                    tile.j*48,tile.i*48,48,48,
                          (j*48)-this.camera.x,(i*48) - this.camera.y ,48,48);
            } else {}
        }   
    }
}

 
Game.prototype.render_sprites = function (time) {
    this.camera.update(time);
	this.player.update(time);

	this.monster.update(time);
    this.monster1.update(time);
    this.monster2.update(time);
    this.monster3.update(time);
    this.monster4.update(time);
    this.boss.update(time);
    this.forEnd.update(time);
	

    // агр мобов

    // this.scope = {
    //     x: this.monster.x - this.camera.x,
    //     y: this.monster.y - this.camera.y,
    //     radius: 100
    // }

    // this.scope1 = {
    //     x: this.player.x - this.camera.x,
    //     y: this.player.y - this.camera.y,
    //     w: 65,
    //     h: 75,
    // }

	// this.ctx.fillStyle = "#fff";
    // this.ctx.beginPath();                       
    // this.ctx.arc(this.scope.x + 32, this.scope.y + 32, this.scope.radius, 0, Math.PI * 2, true);
    // this.ctx.fill();

    // this.ctx.fillStyle = "#fff";
    // this.ctx.fillRect(this.scope1.x, this.scope1.y, this.scope1.w, this.scope1.h);

    // if(this.scope.y + this.scope.radius > this.scope1.y &&
    //   this.scope.x + this.scope.radius > this.scope1.x &&
    //   this.scope.x - this.scope.radius < this.scope1.x + this.scope1.w &&
    //   this.scope.y - this.scope.radius < this.scope1.y + this.scope1.h) {
        // if (this.player.x + 32 < this.monster.x) {
        //     this.monster.x -= 2;
            
        // } else if (this.player.y + 32 < this.monster.y) {
        //     this.monster.y -= 2;
        // } else if (this.player.x + 32 > this.monster.x) {
        //     this.monster.x += 2;
        // } else if (this.player.y + 32 > this.monster.y) {
        //     this.monster.y += 2;
        // } 

        // if(this.scope.x < 650/2 - this.scope.radius*2 && gameVariables.walkable) {
        //     this.monster.x += 3;
        // }
        // else if(this.scope.x > 650/2 - this.scope.radius*2 && gameVariables.walkable) {
        //     this.monster.x -= 3;
        // }
        // else if(this.scope.y < 650/2 - this.scope.radius*2 && gameVariables.walkable) {
        //     this.monster.y += 3;
        // }
        // else if(this.scope.y > 650/2 - this.scope.radius*2 && gameVariables.walkable) {
        //     this.monster.y -= 3;
        // }
            
       

    // }

	// render monsters
 	this.ctx.drawImage(this.imgs["orc"],
 			this.monster.j*64,this.monster.i*64,64,64,
 			( this.monster.x )-this.camera.x,(this.monster.y) - this.camera.y ,64,64);

    this.ctx.drawImage(this.imgs["orc"],
 			this.monster1.j*64,this.monster1.i*64,64,64,
 			( this.monster1.x )-this.camera.x,(this.monster1.y) - this.camera.y ,64,64);
    
    this.ctx.drawImage(this.imgs["orc"],
 			this.monster2.j*64,this.monster2.i*64,64,64,
 			( this.monster2.x )-this.camera.x,(this.monster2.y) - this.camera.y ,64,64);

    this.ctx.drawImage(this.imgs["orc"],
 			this.monster3.j*64,this.monster3.i*64,64,64,
 			( this.monster3.x )-this.camera.x,(this.monster3.y) - this.camera.y ,64,64);

    this.ctx.drawImage(this.imgs["orc"],
 			this.monster4.j*64,this.monster4.i*64,64,64,
 			( this.monster4.x )-this.camera.x,(this.monster4.y) - this.camera.y ,64,64);


    this.ctx.drawImage(this.imgs["dragon"],
 			this.boss.j*64,this.boss.i*64,64,64,
 			( this.boss.x )-this.camera.x,(this.boss.y) - this.camera.y ,64,64);


	// render player
	this.ctx.drawImage(this.imgs["player"],
            this.player.j*64,this.player.i*64,64,64,
            ( this.player.x )-this.camera.x,(this.player.y) - this.camera.y ,64,64);



	// render arrows
	for(var  i=this.arrows.length;i>0;i--) {
			if ( this.arrows[i-1].active === false) this.arrows.splice(i-1, 1);
	}

	for(var  i=0;i<this.arrows.length;i++) {
		this.arrows[i].update(time);
		this.ctx.drawImage(this.imgs["player"],
	            this.arrows[i].j*64,this.arrows[i].i*64,64,64,
	            ( this.arrows[i].x )-this.camera.x,(this.arrows[i].y) - this.camera.y ,64,64);

	}


}

// не успел реализовать но решил оставить
// Game.prototype.render_boss_attack = function(time) {
//     var vx = Math.cos(currentAngle) * radius;

//     // считаем синус текущего значения угла
//     // и умножаем на значение радиуса
//     var vy = Math.sin(currentAngle) * radius;

//     context.fillStyle = '#fff'; 

//     context.fillRect(100 + vx, 100 + vy, 5, 5);
    
//     currentAngle += 0.1;
// }

Game.prototype.render = function (time) {
    if(buttons.settingsGame.open) {
        buttons.settingsGame.close = false;
        this.ctx.fillStyle = "#25131a";
        this.ctx.fillRect(buttons.settingsGame.x, buttons.settingsGame.y,
                          buttons.settingsGame.w, buttons.settingsGame.h);

        // soundOn and soundOff
        if(buttons.soundBtn.isSoundOn) {
            this.ctx.drawImage(this.imgs["soundOn"],
                                buttons.soundBtn.x, buttons.soundBtn.y, 
                                buttons.soundBtn.w, buttons.soundBtn.h);

        } else {
            this.ctx.drawImage(this.imgs["soundOff"],
                                buttons.soundBtn.x, buttons.soundBtn.y, 
                                buttons.soundBtn.w, buttons.soundBtn.h);
        }
        settings(this.ctx);
    } else {
        buttons.settingsGame.close = true;
       
        if(gameVariables.kill) {
            this.render_bg(time);
        } else {
            this.render_bg(time);
        }
        this.render_sprites(time);

        this.ctx.drawImage(this.imgs["settings"],
                                buttons.settingsGameBtn.x, buttons.settingsGameBtn.y, 
                                buttons.settingsGameBtn.w, buttons.settingsGameBtn.h);
    }
        
    // this.render_boss_attack();
    if (gameVariables.bossDead) {
        buttons.settingsGame.isGameScene = false;
        return "win";
    } else {
        if (gameVariables.playerDead) {
            buttons.settingsGame.isGameScene = false;
            return "lose";
        }
        return "game";
    }
   
};



function Camera(x,y,scene) {
    this.x = x;
    this.y = y;
    this.w = 650;
    this.h = 650;
    this.scene = scene;
}

Camera.prototype.update = function(time) {
    if((this.scene.player.x - this.x) < 320) {
        this.x = this.scene.player.x - 320;
    }
    if((this.scene.player.x - this.x) > 320) {
        this.x = this.scene.player.x - 320;
    }

    if(this.x < 0) {this.x = 0;}
    if(this.x > 650) {this.x = 650;}

    if((this.scene.player.y - this.y) < 320) {
        this.y = this.scene.player.y  - 320;
    }
    if((this.scene.player.y - this.y) > 320) {
        this.y = this.scene.player.y  - 320;
    }

    if(this.y < 0) {this.y = 0;}
    if(this.y > 650) {this.y = 650;}

}



function Player(x,y,scene) {
    this.i = 0;
	this.j = 0;
    this.x = x;
	this.y = y;
	this.type = "player";
	this.scene = scene;
	this.dead = false;
	this.lastTime = 0;
	this.speed = 3;
	this.direction = "down";
	this.status = "start";
	this.change_animation = true;
	this.current_animation_frame = 0;
	this.current_action = this.move_down;
	this.got_obstacle = false;
    this.sprites = {
        standing: {
            right: {
                total: 1,
                frames: [[0,3]]
            },
            left: {
                total: 1,
                frames: [[0,1]]
            },
            up: {
                total: 1,
                frames: [[0,0]]
            },
            down: {
                total: 1,
                frames: [[0,2]]
            }
        },
        walking: {
            right: {
                total: 9,
                frames: [[0,11],[1,11],[2,11],[3,11],[4,11],[5,11],[6,11],[7,11],[8,11]]
            },
            left: {
                total: 9,
                frames: [[0,9],[1,9],[2,9],[3,9],[4,9],[5,9],[6,9],[7,9],[8,9]]
            },
            up: {
                total: 9,
                frames: [[0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[6,8],[7,8],[8,8]]
            },
            down: {
                total: 9,
                frames: [[0,10],[1,10],[2,10],[3,10],[4,10],[5,10],[6,10],[7,10],[8,10]]
            }
        },
        start: {
            down: {
                total: 9,
                frames: [[0,10],[1,10],[2,10],[3,10],[4,10],[5,10],[6,10],[7,10],[8,10]]
            }
        },
        dead: {
            down: {
                total: 6,
                frames: [[0,20],[1,20],[2,20],[3,20],[4,20],[5,20]]
            }
        },
        fire: {
            right: {
                total: 13,
                frames: [[0,19],[1,19],[2,19],[3,19],[4,19],[5,19],[6,19],[7,19],[8,19],[9,19],[10,19],[11,19],[12,19]]
            },
            left: {
                total: 13,
                frames: [[0,17],[1,17],[2,17],[3,17],[4,17],[5,17],[6,17],[7,17],[8,17],[9,17],[10,17],[11,17],[12,17]]
            },
            up: {
                total: 13,
                frames: [[0,16],[1,16],[2,16],[3,16],[4,16],[5,16],[6,16],[7,16],[8,16],[9,16],[10,16],[11,16],[12,16]]
            },
            down: {
                total: 13,
                frames: [[0,18],[1,18],[2,18],[3,18],[4,18],[5,18],[6,18],[7,18],[8,18],[9,18],[10,18],[11,18],[12,18]]
            }
        },
        attack: {
            right: {
                total: 6,
                frames: [[0,15],[1,15],[2,15],[3,15],[4,15],[5,15]]
            },
            left: {
                total: 6,
                frames: [[0,13],[1,13],[2,13],[3,13],[4,13],[5,13]]
            },
            up: {
                total: 6,
                frames: [[0,12],[1,12],[2,12],[3,12],[4,12],[5,12]]
            },
            down: {
                total: 6,
                frames: [[0,14],[1,14],[2,14],[3,14],[4,14],[5,14]]
            }
        }

    };
}

Player.prototype = Object.create(Controls.prototype);

Player.prototype.animate = function () {

    var frame = this.sprites[this.status][this.direction];

    if(this.dead) {
        return true;
    }

    if(this.change_animation) {
        this.change_animation = false;
        this.current_animation_frame = 0;
    } else {
        if(frame.total > 1) {
            this.current_animation_frame++;
            if( (this.current_animation_frame + 1) == frame.total ) {
                if((this.status == "start") || (this.status == "walking") || (this.status == "attack")) {
                    this.current_animation_frame = 0;
                }

                if(this.status == "dead") {
                    this.current_animation_frame = 5;
                    this.dead = true;
                }

                if(this.status == "fire") {
                    this.current_animation_frame = 0;
                    this.set_action(this.direction,"standing");
                    this.scene.arrows.push(new Arrow(this.x,this.y,this.direction,this.scene) );
                    gameVariables.sounds["arrow"].play();
                    
                }
            }
        }
    }


    this.j = frame.frames[this.current_animation_frame][0];
    this.i = frame.frames[this.current_animation_frame][1];

};

Player.prototype.set_action = function (direction,status) {
    if(this.direction != direction) {
        this.direction = direction;
        this.change_animation = true;
    }

    if(this.status != status) {
        this.status = status;
        this.change_animation = true;
    }
};

Player.prototype.is_walkable = function (x,y) {

    if(x < 0 ) {
        this.got_obstacle = true;
        return false;
    };
    if(y < 0) {
        this.got_obstacle = true;
        return false;
    };

    var x1 = x;
    var x2 = x + 64;
    var y1 = y;
    var y2 = y + 64;

    x1 = x1 + 20;
    x2 = x2 - 20;
    y1 = y1 + 45;
    // y2 = y2 - 20;

    var j1 = Math.floor((x1) / 48);
    var j2 = Math.floor((x2) / 48);
    var i1 = Math.floor((y1) / 48);
    var i2 = Math.floor((y2) / 48);

    var walkable = true;
    gameVariables.walkable = walkable;;

    for(var i = i1; i <= i2; i++) {
        for(var j = j1; j <= j2; j++) {
            if(!this.scene.tiles[this.scene.map[i][j]].walk) {
                walkable = false;
            }
        }
    }

    this.got_obstacle = !walkable;
    return walkable;

};



Player.prototype.move_left = function () {
    this.set_action("left","walking");

    if(this.is_walkable(this.x - this.speed,this.y)) {
        this.x = this.x - this.speed;
        if(this.x < 0) {
            this.x = 0;
        }
    }
};

Player.prototype.move_right = function () {
    this.set_action("right","walking");
    if(this.is_walkable(this.x + this.speed,this.y)) {
        this.x = this.x + this.speed;
        if(this.x > 1216) {
            this.x = 1216;
        }
    }
};

Player.prototype.move_up = function () {
    this.set_action("up","walking");
    if(this.is_walkable(this.x ,this.y - this.speed)) {
        this.y = this.y - this.speed;
        if(this.y < 0) {
            this.y =0;
        }
    }
};

Player.prototype.move_down = function () {
    this.set_action("down","walking");
    if(this.is_walkable(this.x,this.y + this.speed)) {
        this.y = this.y + this.speed;
        if(this.y > 1216) {
            this.y = 1216;
        }
    }
};


Player.prototype.fire = function () {
    this.set_action(this.direction,"fire");
}

Player.prototype.attack = function () {
    this.set_action(this.direction,"attack");
}

Player.prototype.start = function () {
    if(this.y < 100) {
        this.y = this.y + this.speed;
    } else {
        this.set_action("down","standing");
    }

}

Player.prototype.update = function (time) {
    this.animate();

    if(this.status == "start") {
        this.start();
        return true;
    }

    if(this.status == "fire") {
        return true;
    }

    if(this.status == "dead") {
        return true;
    }

    if(this.type == "monster" || this.type == "boss") {
        return this.monster_ai_control(time);
    }

    if(this.type == "forEnd") {
        if (this.scene.boss.dead ) {
            gameVariables.bossDead = true;
        }
    }

    if(this.scene.controls.states["fire"]) {
        this.fire();
        return true;
    }

    if(this.scene.controls.states["left"]) {
        this.move_left();
        return true;
    }

    if(this.scene.controls.states["right"]) {
        this.move_right();
        return true;
    }

    if(this.scene.controls.states["forward"]) {
        this.move_up();
        return true;
    }

    if(this.scene.controls.states["backward"]) {
        this.move_down();
        return true;
    }

    this.set_action(this.direction,"standing");


}



Player.prototype.monster_ai_control = function (time) {
    
    
    if(!(this.scene.player.dead) &&
        (this.scene.player.x < this.x + 64 &&
        this.scene.player.x + 64 > this.x  &&
        this.scene.player.y < this.y + 64  &&
        64 + this.scene.player.y > this.y)) {
        // тактический прыжок
        if(this.x > this.scene.player.x) {
            this.direction = "left";
            this.y = this.scene.player.y;
            this.x = this.scene.player.x + 32;
        } else {
            this.direction = "right";
            this.y = this.scene.player.y;
            this.x = this.scene.player.x - 32;
        }
        this.attack();
        // this.scene.sounds['sword'].play();
        this.scene.player.set_action("down","dead");
        return true;
    }


    if((this.got_obstacle) || ((time - this.lastTime) > 3000 )) {
        var actions = [this.move_left,this.move_right,this.move_up,this.move_down];
        this.current_action = actions[Math.floor(Math.random() * actions.length)];
        this.lastTime = time;
        
        
    }
    
    if (this.scene.player.dead) {
        gameVariables.playerDead = true;
    }
    if (this.scene.monster.dead  &&
        this.scene.monster1.dead &&
        this.scene.monster2.dead &&
        this.scene.monster3.dead &&
        this.scene.monster4.dead) {
            gameVariables.kill = true;
            change = true;
    } else {}

   
    
    this.current_action();

    return true;
};

var randx = [650, 680, 720, 790, 810, 600, 670, 890, 830, 900]
var randy = [650, 680, 720, 790, 810, 600, 670, 890, 830, 900]
function rand(arr) {
    for (var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
    return arr;

};

function Arrow(x,y,direction,scene) {
    console.log(rand(randx).pop());
	this.active = true;
	this.x = x;
	this.y = y;
	this.scene = scene;
	this.speed = 10;
	this.direction = direction;
	this.sprites = {
		right: [10,0],
		left: [9,0],
		up: [11,0],
		down: [12,0]
	};
	this.j = this.sprites[direction][0];
	this.i = this.sprites[direction][1];
}

Arrow.prototype.update = function (time) {
	this.move();
};

Arrow.prototype.move = function () {
	var new_x = this.x;
	var new_y = this.y;
	if(this.direction == "right" ) new_x += this.speed;
	if(this.direction == "left" ) new_x -= this.speed;
	if(this.direction == "up" ) new_y -= this.speed;
	if(this.direction == "down" ) new_y += this.speed;


	if(this.is_hit(new_x,new_y)) {
		this.active = false;
		return true;
	} else {
		this.x = new_x;
		this.y = new_y;
	}
}


function hit(x,y,mx,my,monster) {
    if((x > mx) &&
    (x < (mx + 48)) &&
    (y > my) &&
    (y < (my + 48))) {
        if (monster.type = "monster") {
            if(buttons.soundBtn.soundOn && !monster.dead) {
                gameVariables.sounds["monster_death"].play();
            }
        } 
        monster.set_action("down","dead");
        return true;
    }
}

Arrow.prototype.is_hit = function (x,y) {
    var pos_x = x;
    var pos_y = y;
    if(this.direction == "right" ) {pos_x += 64; pos_y += 32; };
    if(this.direction == "left" ) {pos_y += 32; };
    if(this.direction == "up" ) {pos_x += 32;  };
    if(this.direction == "down" ) {pos_x += 32; pos_y += 64; };

    if((pos_x < 0) || (pos_x > 1200) || (pos_y < 0) || (pos_y > 1056)) {
        return true;
    }

    var j = Math.floor(pos_x / 48);
    var i = Math.floor(pos_y / 48);
    
    hit(pos_x,pos_y,this.scene.monster.x,
                    this.scene.monster.y,
                    this.scene.monster);

    hit(pos_x,pos_y,this.scene.monster1.x,
                    this.scene.monster1.y,
                    this.scene.monster1);

    hit(pos_x,pos_y,this.scene.monster2.x,
                    this.scene.monster2.y,
                    this.scene.monster2);
    
    hit(pos_x,pos_y,this.scene.monster3.x,
                    this.scene.monster3.y,
                    this.scene.monster3);
    
    hit(pos_x,pos_y,this.scene.monster4.x,
                    this.scene.monster4.y,
                    this.scene.monster4);

    hit(pos_x,pos_y,this.scene.boss.x,
                    this.scene.boss.y,
                    this.scene.boss);

   
    return	!this.scene.tiles[this.scene.map[i][j]].walk;
}




function Win(screen, controls) {
    Scene.apply(this, arguments);
}
Win.prototype = Object.create(Scene.prototype);
Win.prototype.constructor = Win;

Win.prototype.render = function (time) {
    this.ctx.fillStyle = "#25131a";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height );

    this.ctx.fillStyle = "#fff";
    this.ctx.font="50px courier";
    this.ctx.fillText("Congratulations!!",this.canvas.width / 6 - 25, this.canvas.height/3 - 25);
    
    this.ctx.fillStyle = "#fff";
    this.ctx.fillRect(this.canvas.width / 8 - 30, this.canvas.height/3 , 560, 5);

    this.ctx.font="35px courier";
    this.ctx.fillText("You survived in",this.canvas.width / 5 + 30, this.canvas.height/3 + 75);
    this.ctx.fillText("Skeleton and Mortals!!!",this.canvas.width / 6 - 10, this.canvas.height/3 + 125);

    this.ctx.fillStyle = "#fff";
    this.ctx.font="25px courier";
    this.ctx.fillText("try again",this.canvas.width / 3 + 40, this.canvas.height/2 + 225);

    this.ctx.strokeStyle = "#fff";
    this.ctx.strokeRect(buttons.tryAgainBtn.x, buttons.tryAgainBtn.y, buttons.tryAgainBtn.w, buttons.tryAgainBtn.h);
    return "win";
};



function Lose(screen, controls) {
    Scene.apply(this, arguments);
}
Lose.prototype = Object.create(Scene.prototype);
Lose.prototype.constructor = Lose;

Lose.prototype.render = function (time) {
    this.ctx.fillStyle = "#25131a";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height );

    this.ctx.fillStyle = "#fff";
    this.ctx.font="50px courier";
    this.ctx.fillText("You died!!",this.canvas.width / 4 + 25, this.canvas.height/3 - 25);
    
    this.ctx.fillStyle = "#fff";
    this.ctx.fillRect(this.canvas.width / 8 - 30, this.canvas.height/3 , 560, 5);

    this.ctx.font="35px courier";
    this.ctx.fillText("You didn't survived in",this.canvas.width / 6 - 20, this.canvas.height/3 + 75);
    this.ctx.fillText("Skeleton and Mortals",this.canvas.width / 6 , this.canvas.height/3 + 125);

    this.ctx.fillStyle = "#fff";
    this.ctx.font="25px courier";
    this.ctx.fillText("try again",this.canvas.width / 3 + 40, this.canvas.height/2 + 225);

    this.ctx.strokeStyle = "#fff";
    this.ctx.strokeRect(buttons.tryAgainBtn.x, buttons.tryAgainBtn.y, buttons.tryAgainBtn.w, buttons.tryAgainBtn.h);
    return "lose";
};





function Sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
}

Sound.prototype.play = function () {
    this.sound.play();
};

Sound.prototype.repeat = function () {
    this.sound.play();
    this.sound.volume = 0.3;
    
    
    this.currentTime = 0;
    this.count = 1;
    this.sound.addEventListener("ended", function() {
        if(this.count <= 10) {
            this.sound.play();
        }
        this.count++;
    });
};

Sound.prototype.stop = function () {
    this.sound.pause();
};




function Controls() {
    this.canvas = document.getElementById("screen");
    this.ctx = this.canvas.getContext("2d");
    this.codes = { 
        65: "left", // a
        68: "right", // d
        87: "forward", // w
        83: "backward",  // s
        32: "fire" 
    };
    this.states = { 
        "left": false, 
        "right": false, 
        "forward": false, 
        "backward": false, 
        "fire": false,
        "startClick": false,
        "settingsMenuBtnClick": false,
    };
    this.mouse_coord = {
        x: 0,
        y: 0,
    }
    // console.log(Controls)
   
    
    
    
    
    

    document.addEventListener("keydown", this.onKey.bind(this, true));
    document.addEventListener("keyup", this.onKey.bind(this, false));
    // document.addEventListener("mousedown", this.onClick.bind(this));
    document.addEventListener("mouseup", this.onClick.bind(this));
    document.addEventListener("mousemove", this.onMove.bind(this));
}

Controls.prototype.onKey = function(val, e) {
    var state = this.codes[e.keyCode];
    if (typeof state === "undefined") return;
    this.states[state] = val;
    e.preventDefault && e.preventDefault();
    e.stopPropagation && e.stopPropagation();

    if(gameVariables.kill) {
        gameVariables.sounds["bg"].stop();
        if(buttons.soundBtn.soundOn) {
            gameVariables.sounds["boss_fight"].repeat();
        } else {
            gameVariables.sounds["bg"].stop();
            // gameVariables.sounds["boss_fight"].repeat();
            gameVariables.sounds["boss_fight"].stop();
        }
    }
};
Controls.prototype.onClick = function(e) {
    var startTopLine = buttons.start.y < this.mouse_coord.y;
    var startLeftLine = buttons.start.x < this.mouse_coord.x;
    var startRightLine = buttons.start.x + buttons.start.w > this.mouse_coord.x;
    var startBottomLine = buttons.start.y + buttons.start.h > this.mouse_coord.y;
    
    var exitTopLine = buttons.exit.y < this.mouse_coord.y;
    var exitLeftLine = buttons.exit.x < this.mouse_coord.x;
    var exitRightLine = buttons.exit.x + buttons.exit.w > this.mouse_coord.x;
    var exitBottomLine = buttons.exit.y + buttons.exit.h > this.mouse_coord.y;
    
    var soundBtnTopLine = buttons.soundBtn.y < this.mouse_coord.y;
    var soundBtnLeftLine = buttons.soundBtn.x < this.mouse_coord.x;
    var soundBtnRightLine = buttons.soundBtn.x + buttons.soundBtn.w > this.mouse_coord.x;
    var soundBtnBottomLine = buttons.soundBtn.y + buttons.soundBtn.h > this.mouse_coord.y;

    var settingsMenuBtnTopLine = buttons.settingsMenuBtn.y < this.mouse_coord.y;
    var settingsMenuBtnLeftLine = buttons.settingsMenuBtn.x < this.mouse_coord.x;
    var settingsMenuBtnRightLine = buttons.settingsMenuBtn.x + buttons.settingsMenuBtn.w > this.mouse_coord.x;
    var settingsMenuBtnBottomLine = buttons.settingsMenuBtn.y + buttons.settingsMenuBtn.h > this.mouse_coord.y;

    var tgBtnTopLine = buttons.tgBtn.y < this.mouse_coord.y;
    var tgBtnLeftLine = buttons.tgBtn.x < this.mouse_coord.x;
    var tgBtnRightLine = buttons.tgBtn.x + buttons.tgBtn.w > this.mouse_coord.x;
    var tgBtnBottomLine = buttons.tgBtn.y + buttons.tgBtn.h > this.mouse_coord.y;

    var settingsGameBtnTopLine = buttons.settingsGameBtn.y < this.mouse_coord.y;
    var settingsGameBtnLeftLine = buttons.settingsGameBtn.x < this.mouse_coord.x;
    var settingsGameBtnRightLine = buttons.settingsGameBtn.x + buttons.settingsGameBtn.w > this.mouse_coord.x;
    var settingsGameBtnBottomLine = buttons.settingsGameBtn.y + buttons.settingsGameBtn.h > this.mouse_coord.y;

    var tryAgainBtnTopLine = buttons.tryAgainBtn.y < this.mouse_coord.y;
    var tryAgainBtnLeftLine = buttons.tryAgainBtn.x < this.mouse_coord.x;
    var tryAgainBtnRightLine = buttons.tryAgainBtn.x + buttons.tryAgainBtn.w > this.mouse_coord.x;
    var tryAgainBtnBottomLine = buttons.tryAgainBtn.y + buttons.tryAgainBtn.h > this.mouse_coord.y;

    if (buttons.start.isStart) {
        if (startTopLine && 
            startLeftLine && 
            startRightLine && 
            startBottomLine && e.which == 1) {
            this.states["startClick"] = true;
            buttons.start.isStart = false;
            if(buttons.soundBtn.soundOn) {
                gameVariables.sounds["click"].play();
                gameVariables.sounds["bg"].repeat();
            }
        }
        if (exitTopLine && 
            exitLeftLine && 
            exitRightLine && 
            exitBottomLine && e.which == 1) {
            if(buttons.soundBtn.soundOn) {
                gameVariables.sounds["click"].play();   
            }
            window.close(); 
        }
        if (buttons.settingsMenu.open) {
            if (soundBtnTopLine && 
                soundBtnLeftLine && 
                soundBtnRightLine && 
                soundBtnBottomLine && e.which == 1){
                if (buttons.soundBtn.isSoundOn) {
                    buttons.soundBtn.isSoundOn = false;
                    buttons.soundBtn.soundOn = false;                
    
                } else {
                    buttons.soundBtn.isSoundOn = true;
                    buttons.soundBtn.soundOn = true;
                }
                if (buttons.soundBtn.soundOn) {
                    gameVariables.sounds["click"].play();
                }
            }
        }
        
        
        if (settingsMenuBtnTopLine && 
            settingsMenuBtnLeftLine && 
            settingsMenuBtnRightLine && 
            settingsMenuBtnBottomLine && e.which == 1){
                buttons.settingsMenu.open = true;
                if (buttons.soundBtn.soundOn) {
                    gameVariables.sounds["click"].play();
                } if(!buttons.settingsMenu.close) {
                    buttons.settingsMenu.open = false;
                }
            }

        if (tgBtnTopLine && 
            tgBtnLeftLine && 
            tgBtnRightLine && 
            tgBtnBottomLine && e.which == 1){
                window.open("https://t.me/intrigue_sora", "_blank").focus();
            }

    } else {
        if ( buttons.settingsGame.isGameScene) {
            if (settingsGameBtnTopLine && 
                settingsGameBtnLeftLine && 
                settingsGameBtnRightLine && 
                settingsGameBtnBottomLine && e.which == 1){
                    buttons.settingsGame.open = true;
                    if (buttons.soundBtn.soundOn) {
                        gameVariables.sounds["click"].play();
                    } if(!buttons.settingsGame.close) {
                        buttons.settingsGame.open = false;
                    }
                }
                if (buttons.settingsGame.open) {
                    if (soundBtnTopLine && 
                        soundBtnLeftLine && 
                        soundBtnRightLine && 
                        soundBtnBottomLine && e.which == 1){
                        if (buttons.soundBtn.isSoundOn) {
                            buttons.soundBtn.isSoundOn = false;
                            buttons.soundBtn.soundOn = false;
                            gameVariables.sounds["boss_fight"].stop();
                            gameVariables.sounds["bg"].stop();
                                         
                            
            
                        } else {
                            buttons.soundBtn.isSoundOn = true;
                            buttons.soundBtn.soundOn = true;
                                
                            if (!gameVariables.kill) {
                                gameVariables.sounds["bg"].repeat();
                            } else {
                                gameVariables.sounds["bg"].stop();
                                if(buttons.soundBtn.soundOn) {
                                    gameVariables.sounds["boss_fight"].repeat();
                                } else {
                                    gameVariables.sounds["bg"].stop();
                                    gameVariables.sounds["boss_fight"].stop();
                                }
                            }     
                        }
                        if (buttons.soundBtn.soundOn) {
                            gameVariables.sounds["click"].play();
                        }
                    }
                }
        } else {
            if (tryAgainBtnTopLine && 
                tryAgainBtnLeftLine && 
                tryAgainBtnRightLine && 
                tryAgainBtnBottomLine && e.which == 1){                   
                    window.location.reload();
                }
        }
        
    }
};
Controls.prototype.onMove = function(e) {
    var x = e.pageX - e.target.offsetLeft;
    var y = e.pageY - e.target.offsetTop;
    
    this.mouse_coord.x = x;
    this.mouse_coord.y = y;
};



function GameLoop() {
    this.frame = this.frame.bind(this);
    this.lastTime = 0;
    this.callback = function() {};
}
GameLoop.prototype.start = function(callback) {
    this.callback = callback;
    requestAnimationFrame(this.frame);
};
GameLoop.prototype.frame = function(time) {
    if((time - this.lastTime) > 30) {
        this.lastTime = time;
        this.callback(time);
    }
    requestAnimationFrame(this.frame);
};


var screen = {};
screen.canvas = document.getElementById("screen");
screen.canvas.width = 650;
screen.canvas.height = 650;
screen.imgs = {};
var loop = new GameLoop();

var scenes = {};
var controls = new Controls();
scenes["lib"] = new Lib(screen, controls);
scenes["menu"] = new Menu(screen, controls);
scenes["game"] = new Game(screen, controls);
scenes["win"] = new Win(screen, controls);
scenes["lose"] = new Lose(screen, controls);

var current_scene = "lib";

loop.start(function frame(time) {
    current_scene = scenes[current_scene].render(time);
});