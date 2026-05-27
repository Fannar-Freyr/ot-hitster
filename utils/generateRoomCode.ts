export function generateRoomCode() {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	let code = '';
	for (let i = 0; i < 4; i++) {
		code += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	console.log(`🔢 Generated room code: ${code}`);
	return code;
}
