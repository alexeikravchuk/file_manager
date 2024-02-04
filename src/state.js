class State {
	#values = new Map();

	getValue(key) {
		return this.#values.get(key);
	}

	setValue(key, value) {
		this.#values.set(key, value);
	}

	deleteValue(key) {
		this.#values.delete(key);
	}
}

export default new State();
