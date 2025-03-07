import * as sys from './sys'
import type { V3, V4, M3, Plane } from './types'

export const origin: V3 = [0.0, 0.0, 0.0];
export const emptyV3 = (): V3 => [0.0, 0.0, 0.0]
export const emptyV4 = (): V4 => [0.0, 0.0, 0.0, 0.0]

export const perpendicular = function(v: V3)
{
	let pos = 0;
	let minelem = 1;
	if (Math.abs(v[0]) < minelem)
	{
		pos = 0;
		minelem = Math.abs(v[0]);
	}
	if (Math.abs(v[1]) < minelem)
	{
		pos = 1;
		minelem = Math.abs(v[1]);
	}
	if (Math.abs(v[2]) < minelem)
	{
		pos = 2;
		minelem = Math.abs(v[2]);
	}
	const tempvec = [0.0, 0.0, 0.0];
	tempvec[pos] = 1.0;
	const inv_denom = 1.0 / (v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
	const d = (tempvec[0] * v[0] + tempvec[1] * v[1] + tempvec[2] * v[2]) * inv_denom;
	const dst: V3 = [
		tempvec[0] - d * v[0] * inv_denom,
		tempvec[1] - d * v[1] * inv_denom,
		tempvec[2] - d * v[2] * inv_denom
	];
	normalize(dst);
	return dst;
};

export const rotatePointAroundVector = function(dir: V3, point: V3, degrees: number): V3
{
	const r = perpendicular(dir);
	const up = crossProduct(r, dir);
	const m: M3 = [
		[r[0], up[0], dir[0]],
		[r[1], up[1], dir[1]],
		[r[2], up[2], dir[2]]
	];
	const im: M3 = [
		[m[0][0], m[1][0], m[2][0]],
		[m[0][1], m[1][1], m[2][1]],
		[m[0][2], m[1][2], m[2][2]]
	];
	const s = Math.sin(degrees * Math.PI / 180.0);
	const c = Math.cos(degrees * Math.PI / 180.0);
	const zrot: M3 = [[c, s, 0], [-s, c, 0], [0, 0, 1]];
	const rot = concatRotations(concatRotations(m, zrot), im);
	return [
		rot[0][0] * point[0] + rot[0][1] * point[1] + rot[0][2] * point[2],
		rot[1][0] * point[0] + rot[1][1] * point[1] + rot[1][2] * point[2],
		rot[2][0] * point[0] + rot[2][1] * point[1] + rot[2][2] * point[2]
	];
};

export const anglemod = function(a: number)
{
	return (a % 360.0 + 360.0) % 360.0;
};

export const boxOnPlaneSide = function(emins: V3, emaxs:V3, p: Plane)
{
	if (p.type <= 2)
	{
		if (p.dist <= emins[p.type])
			return 1;
		if (p.dist >= emaxs[p.type])
			return 2;
		return 3;
	}
	let dist1: number, dist2: number;
	switch (p.signbits)
	{
	case 0:
		dist1 = p.normal[0] * emaxs[0] + p.normal[1] * emaxs[1] + p.normal[2] * emaxs[2];
		dist2 = p.normal[0] * emins[0] + p.normal[1] * emins[1] + p.normal[2] * emins[2];
		break;
	case 1:
		dist1 = p.normal[0] * emins[0] + p.normal[1] * emaxs[1] + p.normal[2] * emaxs[2];
		dist2 = p.normal[0] * emaxs[0] + p.normal[1] * emins[1] + p.normal[2] * emins[2];
		break;
	case 2:
		dist1 = p.normal[0] * emaxs[0] + p.normal[1] * emins[1] + p.normal[2] * emaxs[2];
		dist2 = p.normal[0] * emins[0] + p.normal[1] * emaxs[1] + p.normal[2] * emins[2];
		break;
	case 3:
		dist1 = p.normal[0] * emins[0] + p.normal[1] * emins[1] + p.normal[2] * emaxs[2];
		dist2 = p.normal[0] * emaxs[0] + p.normal[1] * emaxs[1] + p.normal[2] * emins[2];
		break;
	case 4:
		dist1 = p.normal[0] * emaxs[0] + p.normal[1] * emaxs[1] + p.normal[2] * emins[2];
		dist2 = p.normal[0] * emins[0] + p.normal[1] * emins[1] + p.normal[2] * emaxs[2];
		break;
	case 5:
		dist1 = p.normal[0] * emins[0] + p.normal[1] * emaxs[1] + p.normal[2] * emins[2];
		dist2 = p.normal[0] * emaxs[0] + p.normal[1] * emins[1] + p.normal[2] * emaxs[2];
		break;
	case 6:
		dist1 = p.normal[0] * emaxs[0] + p.normal[1] * emins[1] + p.normal[2] * emins[2];
		dist2 = p.normal[0] * emins[0] + p.normal[1] * emaxs[1] + p.normal[2] * emaxs[2];
		break;
	case 7:
		dist1 = p.normal[0] * emins[0] + p.normal[1] * emins[1] + p.normal[2] * emins[2];
		dist2 = p.normal[0] * emaxs[0] + p.normal[1] * emaxs[1] + p.normal[2] * emaxs[2];
		break;
	default:
		sys.error('Vec.BoxOnPlaneSide: Bad signbits');
	}
	let sides = 0;
	if (dist1 >= p.dist)
		sides = 1;
	if (dist2 < p.dist)
		sides += 2;
	return sides;
};

export const angleVectors = function(angles: V3, forward:V3 = null, right:V3 = null, up:V3 = null)
{
	let angle: number;
	
	angle = angles[0] * Math.PI / 180.0;
	const sp = Math.sin(angle);
	const cp = Math.cos(angle);
	angle = angles[1] * Math.PI / 180.0;
	const sy = Math.sin(angle);
	const cy = Math.cos(angle);
	angle = angles[2] * Math.PI / 180.0;
	const sr = Math.sin(angle);
	const cr = Math.cos(angle);

	if (forward != null)
	{
		forward[0] = cp * cy;
		forward[1] = cp * sy;
		forward[2] = -sp;
	}
	if (right != null)
	{
		right[0] = cr * sy - sr * sp * cy;
		right[1] = -sr * sp * sy - cr * cy;
		right[2] = -sr * cp;
	}
	if (up != null)
	{
		up[0] = cr * sp * cy + sr * sy;
		up[1] = cr * sp * sy - sr * cy;
		up[2] = cr * cp;
	}
};

export const dotProductV3 = function(v1: V3 | V4, v2: V3 | V4)
{
	return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
};

export const copy = function(v1: V3, v2: V3)
{
	v2[0] = v1[0];
	v2[1] = v1[1];
	v2[2] = v1[2];
};

export const subtract = (v1: V3, v2: V3): V3 => {
	return [
		v1[0]-v2[0],
		v1[1]-v2[1],
		v1[2]-v2[2],
	]
}
export const multiply = (v1: V3, v2: V3): V3 => {
	return [
		v1[0]*v2[0],
		v1[1]*v2[1],
		v1[2]*v2[2],
	]
}
export const multiplyScaler = (v1: V3, scaler: number): V3 => {
	return [
		v1[0]*scaler,
		v1[1]*scaler,
		v1[2]*scaler,
	]
}


export const crossProduct = function(v1: V3, v2: V3)
{
	return [
		v1[1] * v2[2] - v1[2] * v2[1],
		v1[2] * v2[0] - v1[0] * v2[2],
		v1[0] * v2[1] - v1[1] * v2[0]
	];
};


export const vectorMA = (veca: V3, scale: number, vecb: V3): V3 => {
	return [
		veca[0] + scale*vecb[0],
		veca[1] + scale*vecb[1],
		veca[2] + scale*vecb[2]
	]
}

export const length = function(v: V3)
{
	return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
};

export const normalize = function(v: V3)
{
	const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
	if (length === 0.0)
	{
		v[0] = v[1] = v[2] = 0.0;
		return 0.0;
	}
	v[0] /= length;
	v[1] /= length;
	v[2] /= length;
	return length;
};

export const concatRotations = function(m1: M3, m2: M3): M3
{
	return [
		[
			m1[0][0] * m2[0][0] + m1[0][1] * m2[1][0] + m1[0][2] * m2[2][0],
			m1[0][0] * m2[0][1] + m1[0][1] * m2[1][1] + m1[0][2] * m2[2][1],
			m1[0][0] * m2[0][2] + m1[0][1] * m2[1][2] + m1[0][2] * m2[2][2]
		],
		[
			m1[1][0] * m2[0][0] + m1[1][1] * m2[1][0] + m1[1][2] * m2[2][0],
			m1[1][0] * m2[0][1] + m1[1][1] * m2[1][1] + m1[1][2] * m2[2][1],
			m1[1][0] * m2[0][2] + m1[1][1] * m2[1][2] + m1[1][2] * m2[2][2]
		],
		[
			m1[2][0] * m2[0][0] + m1[2][1] * m2[1][0] + m1[2][2] * m2[2][0],
			m1[2][0] * m2[0][1] + m1[2][1] * m2[1][1] + m1[2][2] * m2[2][1],
			m1[2][0] * m2[0][2] + m1[2][1] * m2[1][2] + m1[2][2] * m2[2][2]
		]
	];
};