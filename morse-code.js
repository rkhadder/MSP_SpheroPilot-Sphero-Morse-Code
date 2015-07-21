function node() {
	this.value = "";
	this.left  = "";
	this.right = "";
}

function morseTree() {
	this.table = 
	{
		"a":".-",
		"b":"-...",
		"c":"-.-.",
		"d":"-..",
		"e":".",
		"f":"..-.",
		"g":"--.",
		"h":"....",
		"i":"..",
		"j":".---",
		"k":"-.-",
		"l":".-..",
		"m":"--",
		"n":"-.",
		"o":"---",
		"p":".--.",
		"q":"--.-",
		"r":".-.",
		"s":"...",
		"t":"-",
		"u":"..-",
		"v":"...-",
		"w":".--",
		"x":"-..-",
		"y":"-.--",
		"z":"--..",
		
		" ":"",
		".":"",
		",":"",
		"!":"",
	};

	this.root = new node();
	this.root.value = " ";

	//Left
	var e = new node();
	e.value = "E";

		//Left
		var i = new node();
		i.value = "I";

			//Left
			var s = new node();
			s.value = "S";

				//Left
				var h = new node();
				h.value = "H";

				s.left = h;

				//Right
				var v = new node();
				v.value = "V";

				s.right = v;

			i.left = s;

			//Right
			var u = new node();
			u.value = "U";

				//Left
				var f = new node();
				f.value = "F";

				u.left = f;

			i.right = u;

		e.left = i;

		//Right
		var a = new node();
		a.value = "A";

			//Left
			var r = new node();
			r.value = "R";

				//Left
				var l = new node();
				l.value = "L";

				r.left = l;

			a.left = r;

			//Right
			var w = new node();
			w.value = "W";

				//Left
				var p = new node();
				p.value = "P";

				w.left = p;

				//Right
				var j = new node();
				j.value = "J";

				w.right = j;

			a.right = w;

		e.right = a;

	this.root.left = e;

	//Right
	var t = new node();
	t.value = "T";

		//Left
		var n = new node();
		n.value = "N";

			//Left
			var d = new node();
			d.value = "D";

				//Left
				var b = new node();
				b.value = "B";

				d.left = b;

				//Right
				var x = new node();
				x.value = "X";

				d.right = x;

			n.left = d;

			//Right
			var k = new node();
			k.value = "K";

				//Left
				var c = new node();
				c.value = "C";

				k.left = c;

				//Right
				var y = new node();
				y.value = "Y";

				k.right = y;

			n.right = k;

		t.left = n;

		//Right
		var m = new node();
		m.value = "M";

			//Left
			var g = new node();
			g.value = "G";

				//Left
				var z = new node();
				z.value = "Z";

				g.left = z;

				//Right
				var q = new node();
				q.value = "Q";

				g.right = q;

			m.left = g;

			//Right
			var o = new node();
			o.value = "O";

			m.right = o;

		t.right = m;

	this.root.right = t;
}


var mt = new morseTree();
function encode(english) {
	var morse = "";

	for (var i = 0; i < english.length; i++) {
		morse += mt.table[english.charAt(i)] + " ";
	};

	return morse;
}
function decode(morse) {
	var english = "";

	var node = mt.root;
	for (var i = 0; i < morse.length; i++) {
		var c = morse.charAt(i);

		if (node === null)
			return "null";

		if (c === " ") {
			english += node.value;
			node = mt.root;
		} else if (c === ".") {
			node = node.left;
		} else if (c === "_" || c === "-") {
			node = node.right;
		}
	};

	english += node.value;

	return english;
}