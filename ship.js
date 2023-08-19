import Canvas from "./canvas";

export default class Ship extends Canvas {
	x = 0;
	y = 0;
	vx = 0;
	vy = 0;
	tx = 0.02;
	ty = 0.04;
	blasters = {};

	FLYING = "FLYING";
	TAKINGOFF = "TAKINGOFF";
	CRASHED = "CRASHED";
	ORBIT = "ORBIT";
	LANDED = "LANDED";
	LANDEDTOOFAST = "LANDEDTOOFAST";

	state = this.FLYING;

	constructor(options) {
		super(options);
		this.shipWidth = options.w;
	}

	loaded(img) {
		this.context.scale(0.5, 0.5);
		this.context.drawImage(img, 0, 0);
	}

	createShip(level) {
		this.level = level;
		this.vx = 0;
		this.vy = 0;
		this.fuel = this.level.fuel;
		this.carrying = null;
		this.state = this.FLYING;
	}

	resetBlasters() {
		this.blasters = {
			up: false,
			down: false,
			left: false,
			right: false,
		};
	}

	update(world, left, right, up, down) {
		this.world = world;
		this.resetBlasters();

		if (this.fuel > 0) {
			if (left) {
				this.blasters.left = true;
				this.fuel--;
				this.vx -= this.tx;
			}
			if (right) {
				this.blasters.right = true;
				this.fuel--;
				this.vx += this.tx;
			}
			if (up) {
				if (this.state === this.TAKINGOFF) {
					this.state = this.FLYING;
				}

				this.blasters.up = true;
				this.fuel -= 2;
				this.vy -= this.ty;
			}
			if (down) {
				this.blasters.down = true;
				this.fuel -= 2;
				this.vy += this.ty;
			}
		}

		if (this.fuel < 0) {
			this.fuel = 0;
		}

		this.vx += this.world.wind;
		this.vy += this.world.gravity;

		this.x += this.vx;
		this.y += this.vy;

		// if @x < 0
		//   @vx = -@vx
		//   @x = -@x
		// else if @x > @world.w
		//   @vx = -@vx
		//   @x = @world.w - (@x - @world.w)

		if (this.x < 0) {
			this.x += this.world.w;
		} else if (this.x > this.world.w) {
			this.x -= this.world.w;
		}

		const spot = this.world.profile[~~this.x];

		const floor = this.world.h - spot.y;

		this.heightAboveFloor = floor - this.y;

		if (this.y < -150) {
			this.vx = 0;
			this.vy = 0;
			this.state = this.ORBIT;
			this.resetBlasters();
		} else if (this.y >= floor) {
			this.y = floor;

			if (this.state === this.TAKINGOFF) {
				if (this.vy > 0) {
					this.vy = 0;
				} // trying to fly through the floor!
				return;
			}

			if (spot.safe) {
				if (this.vy < 0.5) {
					this.vx = 0;
					this.vy = 0;
					this.platform = spot.platform;
					this.state = this.LANDED;
					this.resetBlasters();
					return;
				}

				if (spot.platform.bouncy != null) {
					// coz we bounce around here bro.
					this.vy = -this.vy;
					this.y = floor - (this.y - floor);
					return;
				}
				this.vx = 0;
				this.vy = 0;
				this.state = this.LANDEDTOOFAST;
				this.resetBlasters();
				return;
			}
			this.vx = 0;
			this.vy = 0;
			this.state = this.CRASHED;
			this.resetBlasters();
		}
	}
}
