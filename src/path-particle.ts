
import { ParticleUtils, PathParticle } from 'pixi-particles';

export class PathParticleBetter extends PathParticle
{

    private vv: [number, number] = [0,0];

    public init() {
        super.init();
        this.vv = [0,-10];
    }
    /**
     * Updates the particle.
     * @param delta Time elapsed since the previous frame, in __seconds__.
     */
    public update(delta: number): number
    {
        const lerp = this.Particle_update(delta);
        // if the particle died during the update, then don't bother

        if (lerp >= 0 && this.path)
        {
            // increase linear movement based on speed
            if (this._doSpeed)
            {
                const speed = this.speedList.interpolate(lerp) * this.speedMultiplier;

                this.movement += speed * delta;
            }
            else
            {
                const speed = this.speedList.current.value * this.speedMultiplier;

                this.movement += speed * delta;
            }
            let lastx = this.position.x;
            let lasty = this.position.y;
            // set up the helper point for rotation
            let hPoint = this.path(this.movement, {x: this.position.x - this.initialPosition.x, y: this.position.y - this.initialPosition.y}, delta, this.vv);
            this.position.x = this.initialPosition.x + hPoint.x;
            this.position.y = this.initialPosition.y + hPoint.y;
            this.vv = [(this.position.x - lastx) / delta, (this.position.y - lasty) / delta]
        }

        return lerp;
    }

    /**
     * Don't do anything
     */
    public static parseData(extraData: any): any
    {
        return extraData;
    }
}