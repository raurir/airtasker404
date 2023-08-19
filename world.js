import Canvas from "./canvas";

export default class World extends Canvas {
  static initClass() {
    this.prototype.gravity = 0.013;
    this.prototype.profile = [];

    // this rain is not enabled, it kinda sux

    this.prototype.rainDrops = [];
  }

  constructor(options) {
    super(options);
  }

  createLand(level) {
    let w, x, y;
    let asc, end;
    let asc1, end1;
    this.level = level;
    const s1 = Math.random() * 0.01;
    const s2 = Math.random() * 0.01;

    const s3 = 2 * ~~(Math.random() * 3);
    const s4 = 2 * ~~(Math.random() * 3);
    const s5 = 2 * ~~(Math.random() * 3);
    const s6 = 2 * ~~(Math.random() * 3);

    let h = this.num(this.h * 0.2, this.h * 0.4);

    this.gravity = this.level.gravity;
    this.wind = this.level.wind;

    let platformIndex = 0;
    const getPlatform = () => {
      const p = this.level.platforms[platformIndex];
      if (p != null) {
        const platform = {};
        for (const k in p) {
          const v = p[k];
          platform[k] = v;
        }
        platform.x *= this.w;
        return platform;
      }
    };
    let platform = getPlatform();
    // con.log("platform", platform)

    let c = 0;
    let doingPlatform = false;
    for (
      x = 0, end = this.w, asc = end >= 0;
      asc ? x < end : x > end;
      asc ? x++ : x--
    ) {
      // safeColour = null

      var safe;
      if (platform != null && x >= platform.x && x <= platform.x + platform.w) {
        safe = true;
        doingPlatform = true;
        // safeColour = platform.colour

        this.level.platforms[platformIndex].y = y;
      } else {
        if (doingPlatform) {
          doingPlatform = false;
          platformIndex++; // move to next platform
          platform = getPlatform();
        }

        safe = false;
        // colour = @rgba()
        h += this.num(-3, 3);
        y = (Math.sin(c * s1) + Math.sin(c * s2)) * 100 + 100 + h;
        // y = (
        //   Math.sin(c / @w * Math.PI * s3) +
        //   Math.sin(c / @w * Math.PI * s4) +
        //   Math.sin(c / @w * Math.PI * s5) +
        //   Math.sin(c / @w * Math.PI * s6)
        //   ) * 100 + 100 + h
        c++;
      }

      if (y > this.h) {
        y = this.h;
      }
      if (y < 0) {
        y = 0;
      }

      this.profile[x] = {
        safe,
        y,
        platform: safe ? platform : undefined,
        // colour: safeColour if safeColour?
      };
    }

    this.sky = new Canvas({ w: this.w, h: this.h });

    let grd = this.sky.context.createLinearGradient(
      this.w * 0.25,
      0,
      this.w * 0.75,
      this.h
    );
    grd.addColorStop(0, "#ddd");
    grd.addColorStop(1, "#fff");
    this.sky.context.fillStyle = grd;
    this.sky.context.fillRect(0, 0, this.w, this.h);
    // @drawBlock(@context, 0, 0, @w, @h, "rgba(128,0,0,1)")

    const mask = new Canvas({ w: this.w, h: this.h });

    for (
      x = 0, end1 = this.w, asc1 = end1 >= 0;
      asc1 ? x < end1 : x > end1;
      asc1 ? x++ : x--
    ) {
      const block = this.profile[x];
      h = block.y;
      const g = this.int(100, 120);
      this.drawBlock(mask.context, x, this.h - h, 1, h, "#0f0");
    }

    this.land = new Canvas({ w: this.w, h: this.h });
    this.land.context.drawImage(mask.canvas, 0, 0);
    this.land.context.globalCompositeOperation = "source-in";

    grd = this.land.context.createLinearGradient(0, 0, 0, this.h);
    grd.addColorStop(0, "#8ED6FF");
    grd.addColorStop(1, "#004CB3");
    this.land.context.fillStyle = grd;
    this.land.context.fillRect(0, 0, this.w, this.h);

    this.land.context.globalCompositeOperation = "source-over";

    for (const p of Array.from(this.level.platforms)) {
      // con.log(p)

      x = p.x * this.w;
      y = this.h - p.y;
      ({ w } = p);
      h = 80;
      // grd = @context.createLinearGradient(x,y,x,y + h)
      // grd.addColorStop(0, p.colour)
      // grd.addColorStop(0.2, 'rgba(255,255,255,1)')
      // grd.addColorStop(1, 'rgba(0,0,0,0)')
      this.land.context.fillStyle = "rgba(0,0,0,0.5)";

      const chamferX = 10;
      const chamferY = 40;
      this.land.context.beginPath();
      this.land.context.moveTo(x, y);
      this.land.context.lineTo(x + w, y);
      this.land.context.lineTo(x + w - chamferX, y + chamferY);
      this.land.context.lineTo(x + chamferX, y + chamferY);
      this.land.context.closePath();
      this.land.context.fill();

      if (p.pickup != null) {
        this.package = new Canvas({ w: 20, h: 20 });
        this.package.x = x + w / 2 - 10;
        this.package.y = y - 21;

        this.package.context.fillStyle = "rgba(0,0,0,0.8)";
        this.package.context.fillRect(0, 0, 20, 20);

        this.package.context.globalCompositeOperation = "destination-out";

        this.package.pixels = [];
        for (let i = 0; i < 400; i++) {
          this.package.pixels[i] = i;
        }
      }
    }

    // @drawBlock(@land.context,x,y,w,h, grd)

    // @context.drawImage(@land.canvas, 0, 0)

    this.sun = new Canvas({ w: this.w, h: this.h });
    grd = this.context.createRadialGradient(100, 100, 80, 100, 100, 100);
    grd.addColorStop(0, "#fff");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    this.sun.context.fillStyle = grd;
    this.sun.context.fillRect(0, 0, this.w, this.h);

    return (this.sun.day = 0);
  }

  render() {
    this.sun.day++;

    this.sun.x =
      (Math.sin(this.sun.day * -0.001) * this.w * 2) / 3 + (this.w * 3) / 4;
    this.sun.y =
      (Math.cos(this.sun.day * -0.0011) * this.h * 2) / 3 + (this.h * 1) / 3;

    this.context.drawImage(this.sky.canvas, 0, 0);
    this.context.drawImage(this.sun.canvas, this.sun.x, this.sun.y);
    // @renderRain()
    this.context.drawImage(this.land.canvas, 0, 0);

    if (this.package != null) {
      return this.context.drawImage(
        this.package.canvas,
        this.package.x,
        this.package.y
      );
    }
  }

  removePackage() {
    for (let i = 0; i < 8; i++) {
      this.removePackagePixel();
    }
    this.render();

    if (this.package.pixels.length > 0) {
      return setTimeout(() => this.removePackage(), 1000 / 60);
    }
  }

  removePackagePixel() {
    if (this.package.pixels.length === 0) {
      return;
    }

    const index = ~~(Math.random() * this.package.pixels.length);
    const pixel = this.package.pixels.splice(index, 1);
    const pixelX = pixel % 20;
    const pixelY = Math.floor(pixel / 20);

    this.package.context.fillStyle = "rgba(0,0,0,1)";
    return this.package.context.fillRect(pixelX, pixelY, 1, 1);
  }
  resetRain() {
    const grey = 1; // ~~(Math.random() * 100) + 100
    return {
      x: -200 + Math.random() * (this.w + 200),
      y: -1,
      ox: 0,
      vx: (0.4 + Math.random() * 0.2) * 0.01,
      vy: 1 + Math.random() * 0.1,
      colour: `rgba(${grey},${grey},${grey},${grey}.5)`,
    };
  }

  spawnRain() {
    const rain = this.resetRain();
    rain.x = -200 + Math.random() * (this.w + 200);
    rain.y = -200 + Math.random() * (this.h + 200);
    con.log("spawnRain!!!");
    return this.rainDrops.push(rain);
  }

  renderRain() {
    if (this.rainDrops.length < 200) {
      this.spawnRain();
    }

    return (() => {
      const result = [];
      for (let i = 0; i < this.rainDrops.length; i++) {
        const s = this.rainDrops[i];
        s.ox += s.vx;
        s.x += Math.sin(s.ox) * 0.5 + this.wind * 20;
        s.y += s.vy;

        if (
          s.x < -100 ||
          s.x > this.w + 100 ||
          s.y < -100 ||
          s.y > this.h + 100
        ) {
          this.rainDrops[i] = this.resetRain();
        }

        this.context.fillStyle = s.colour;
        result.push(this.context.fillRect(s.x, s.y, 1, 1));
      }
      return result;
    })();
  }
}
World.initClass();
