// twitter: @mmzy3

function main(){
    const imageWidth = 400;
    const imageHeight = 600;

    // 画像プリロード
    function preloadImages(callback) {
        const imgFiles = [ "shio.jpg", "gumi.jpg", "miyu.jpg", "yuzu.jpg", "momo.jpg", "misako.jpg" ];
        var images = [];
        var count = imgFiles.length;
        for(var i in imgFiles){
            images[i] = new Image();
            images[i].onload = function(){
                if(--count == 0){
                    callback(images);
                }
            }
            images[i].src = imgFiles[i];
        }
    }

    // ドラム
    function createDrum(images, topSpeed, accelSpeed, onclick){
        var obj = document.createElement("div");
        obj.style.position = "absolute";
        obj.style.overflow = "hidden";

        obj.img = [];
        for(var i in images){
            obj.img[i] = document.createElement("img");
            obj.img[i].style.position = "absolute";
            obj.img[i].src = images[i].src;
            obj.appendChild(obj.img[i]);
        }

        obj.turnTopSpeed = topSpeed; // 最高速
        obj.turnAccelSpeed = accelSpeed; // 加速度
        obj.turnSpeed = 0; // 回転スピード
        obj.turnPos = 0;//Math.floor(Math.random() * obj.img.length); // 回転位置
        obj.LastImgIndex = obj.turnPos; // 前回の表示画像インデックス

        obj.imgWidth = 0; // 横幅

        // ドラムの回転ON/OFF
        obj.start = false;
        obj.startTurn = function(){
            this.start = true;
        }
        obj.stopTurn = function(){
            this.start = false;
        }
 
        // ドラムの位置設定
        obj.setBounds = function(xOrg, yOrg, y, w, h){
            obj.imgWidth = w;

            this.style.left = xOrg + "px";
            this.style.top = (yOrg + y) + "px";
            this.style.width = w + "px";
            this.style.height = h + "px";

            for(var i in this.img){
                this.img[i].style.top = (-y) + "px";
                this.img[i].style.width = w + "px";
            }
        }

        // ドラムのアニメーション
        obj.updateFrame = function(frames){
            var needAnimation = true;

            // 表示画像インデックス
            var imgIndex = Math.floor(this.turnPos);

            // 加減速
            if(this.start){
                // 加速
                this.turnSpeed += this.turnAccelSpeed * frames;
                if(this.turnSpeed > this.turnTopSpeed){
                    this.turnSpeed = this.turnTopSpeed;
                }
            }else{
                // 表示画像が切り替わるタイミングで停止
                if(obj.LastImgIndex != imgIndex){
                    this.turnPos = imgIndex;
                    this.turnSpeed = 0;
                }
                if(this.turnSpeed == 0){
                    needAnimation = false;
                }
            }

            // 表示画像インデックス保存
            obj.LastImgIndex = imgIndex;

            // 画像位置設定
            var x = -(this.turnPos - imgIndex) * this.imgWidth;
            for(var i = 0; i < this.img.length; i++){
                this.img[imgIndex].style.left = x + "px";
                imgIndex = (imgIndex + 1) % this.img.length;
                x += this.imgWidth;
            }

            // 原点位置更新
            this.turnPos += this.turnSpeed * frames;
            if(this.turnPos >= this.img.length){
                this.turnPos -= Math.floor(this.turnPos / this.img.length) * this.img.length;
            }

            return needAnimation;
        }

        return obj;
    }

    preloadImages(function(images){
        document.body.style.width = "100%";
        document.body.style.height = "100%";
        document.body.style.overflow = "hidden";

        // ドラム作成
        const drum1 = createDrum(images, 0.117, 0.004);
        const drum2 = createDrum(images, 0.113, 0.002);
        const drum3 = createDrum(images, 0.107, 0.001);
    	document.body.appendChild(drum1);
    	document.body.appendChild(drum2);
    	document.body.appendChild(drum3);

        // クリック時の処理
        drum1.onclick = onClick;
        drum2.onclick = onClick;
        drum3.onclick = onClick;
        function onClick(){
            if(drum1.start || drum2.start || drum3.start){
                this.stopTurn()
            }else{
                drum1.startTurn();
                drum2.startTurn();
                drum3.startTurn();
            }
            requestAnimation();
        }

        // リサイズ時の処理
        window.addEventListener("resize", onResize);
        onResize();
        function onResize(){
            const clientWidth = document.documentElement.clientWidth;
            const clientHeight = document.documentElement.clientHeight;

            // 全体のサイズ
            var w = clientWidth;
            var h = w * imageHeight / imageWidth;
            if(h > clientHeight){
                h = clientHeight;
                w = h * imageWidth / imageHeight;
            }
            // 原点
            var xOrg = (clientWidth - w) / 2;
            var yOrg = (clientHeight - h) / 2;

            // ドラムの高さ
            var h1 = Math.round(h * 0.366);
            var h2 = Math.round(h * 0.333);
            var h3 = h - h1 - h2;

            // ドラムの座標設定
            var y = 0;
            drum1.setBounds(xOrg, yOrg, y, w, h1);
            y += h1;
            drum2.setBounds(xOrg, yOrg, y, w, h2);
            y += h2;
            drum3.setBounds(xOrg, yOrg, y, w, h3);
            requestAnimation();
        }

        // アニメーション開始
        var requestAnimationID;
        var prevDate;
        requestAnimation();
        function requestAnimation(){
            if(!requestAnimationID){
                requestAnimationID = requestAnimationFrame(function(){
                    requestAnimationID = undefined;

                    // 経過時間(フレーム数)取得
                    var currentDate = Date.now();
                    var frames = 1;
                    if(prevDate){
                        frames = (currentDate - prevDate) * 0.06; //60fps換算
                    }
                    prevDate = currentDate;

                    // 各ドラムの更新
                    var needAnimation = drum1.updateFrame(frames);
                    needAnimation |= drum2.updateFrame(frames);
                    needAnimation |= drum3.updateFrame(frames);

                    if(needAnimation){
                        // アニメーション継続
                        requestAnimation();
                    }else{
                        // アニメーション停止
                        prevDate = undefined;
                    }
                });
            }
        }
    });
}

main();