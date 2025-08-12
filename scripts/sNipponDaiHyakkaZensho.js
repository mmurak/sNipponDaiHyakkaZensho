class GlobalManager {
	constructor() {
		this.textEntry = document.getElementById("TextEntry");
		this.textEntry.addEventListener("focus", () => {this.textEntry.select();});
		this.indexSearch = document.getElementById("IndexSearch");
		this.indexSearch.addEventListener("click", searchIndex);
		this.eraseEntry = document.getElementById("EraseEntry");
		this.eraseEntry.addEventListener("click", eraseTextEntry);
		this.pageEntry = document.getElementById("PageEntry");
		this.pageEntry.addEventListener("focus", () => {this.pageEntry.select();});
		this.openPage = document.getElementById("OpenPage");
		this.openPage.addEventListener("click", openDirect);
		this.erasePage = document.getElementById("ErasePage");
		this.erasePage.addEventListener("click", erasePageEntry);
		document.addEventListener("keyup", (evt) => {
			if (evt.key == "Enter") {
				if (isElementFocused(this.pageEntry)) {
					openDirect();
					this.pageEntry.focus();
				} else if (evt.shiftKey) {
					searchIndex();
					this.textEntry.focus();
				}
			} else if (evt.key == "Escape") {
				if (isElementFocused(this.pageEntry)) {
					erasePageEntry();
				} else if (isElementFocused(this.textEntry)) {
					eraseTextEntry();
				}
			}
		});
		//
		this.idxURL = "https://dl.ndl.go.jp/pid/12405208/1/";
		this.volInfo = [
			[],
			["https://dl.ndl.go.jp/pid/12405180/1/", 11, 947],
			["https://dl.ndl.go.jp/pid/12405181/1/", 6, 907],
			["https://dl.ndl.go.jp/pid/12405182/1/", 6, 939],
			["https://dl.ndl.go.jp/pid/12405183/1/", 6, 891],
			["https://dl.ndl.go.jp/pid/12405184/1/", 6, 927],	// 5
			["https://dl.ndl.go.jp/pid/12405185/1/", 6, 967],
			["https://dl.ndl.go.jp/pid/12405186/1/", 6, 871],
			["https://dl.ndl.go.jp/pid/12405187/1/", 6, 895],
			["https://dl.ndl.go.jp/pid/12405188/1/", 7, 935],
			["https://dl.ndl.go.jp/pid/12405189/1/", 7, 919],	// 10
			["https://dl.ndl.go.jp/pid/12405190/1/", 6, 887],
			["https://dl.ndl.go.jp/pid/12405191/1/", 7, 943],
			["https://dl.ndl.go.jp/pid/12405192/1/", 6, 883],
			["https://dl.ndl.go.jp/pid/12405193/1/", 6, 931],
			["https://dl.ndl.go.jp/pid/12405194/1/", 6, 927],	// 15
			["https://dl.ndl.go.jp/pid/12405197/1/", 6, 919],
			["https://dl.ndl.go.jp/pid/12405195/1/", 6, 921],
			["https://dl.ndl.go.jp/pid/12405196/1/", 6, 915],
			["https://dl.ndl.go.jp/pid/12405198/1/", 6, 895],
			["https://dl.ndl.go.jp/pid/12405199/1/", 6, 921],	// 20
			["https://dl.ndl.go.jp/pid/12405200/1/", 6, 891],
			["https://dl.ndl.go.jp/pid/12405201/1/", 6, 907],
			["https://dl.ndl.go.jp/pid/12405202/1/", 6, 891],
			["https://dl.ndl.go.jp/pid/12405204/1/", 6, 879],
			["https://dl.ndl.go.jp/pid/12405208/1/", 6, 1007],	// 25
		];
		this.URL = 0;
		this.OFFSET = 1;
		this.ENDPAGE = 2;
	}
}
const G = new GlobalManager();
const R = new Regulator();
G.textEntry.focus();

function searchIndex() {
	let target = G.textEntry.value;
	target = target.replace(/[ァ-ン]/g, (s) => {
		return String.fromCharCode(s.charCodeAt(0) - 0x60);
	});
	let rTarget = R.regulate(target);
	if (rTarget.length == 0)  return;
	let idx = index.length - 1;
	while (index[idx] > rTarget) {
		idx--;
	}
	const page = index[0] + idx;
	windowOpen(G.idxURL + page, "索引検索結果");
}

function openDirect() {
	const value = G.pageEntry.value;
	const m = value.match(/(\d\d)(\d+)/);
	if (m == null) {
		alert("閲覧したい巻数を2桁で、続けてページ数を指定してください。");
		return;
	}
	const volNo = Number(m[1]);
	const page = Number(m[2]);
	if (checkInput(volNo, page) == -1)  return;
	let fixedPage = fixMissingPages(volNo, page);
	fixedPage = fixOverlayPages(volNo, page);
	const frame = Math.trunc(Number(fixedPage) / 2) + G.volInfo[volNo][G.OFFSET];
	windowOpen(G.volInfo[volNo][G.URL] + frame, "検索結果");
}

function fixMissingPages(volNo, page) {
	const missingPages = [	// VolNo, PageFrom(inclusive), PageTo(inclusive)
//		[12, 619, 619],
	];
	// このロジックは1巻中に欠落ページが散在している場合を想定していない点に注意。
	for (let i = 0; i < missingPages.length; i++) {
		if (volNo == missingPages[i][0]) {
			if ((page >= missingPages[i][1]) && (page <= missingPages[i][2])) {
				alert("このページは欠落しています。");
				return missingPages[i][1];
			}
			if (page > missingPages[i][2]) {
				return page - (missingPages[i][2] - missingPages[i][1] + 1);
			}
		}
	}
	return page;
}

function fixOverlayPages(volNo, page) {
	const overlayPages = [	// VolNo, PageAt, NumberOfPages
		[1, 57, 2], [1, 481, 2], [1, 613, 2], [1, 817, 2],
		[2, 513, 2], [2, 661, 2],
		[3, 209, 2], [3, 557, 2], [3, 641, 2], [3, 905, 2],
		[4, 661, 2],
		[5, 449, 6],
		[6, 25, 2], [6, 893, 2],
		[10, 81, 2], [10, 837, 2],
		[11, 49, 2],
		[12, 619, 2],
		[13, 501, 2],
		[14, 205, 2],
		[15, 353, 2], [15, 421, 2],
		[16, 609, 2],
		[17, 829, 4],
		[19, 129, 2], [19, 461, 2], [19, 669, 2],
		[20, 209, 6], [20, 463, 6],
		[22, 533, 2],
		[23, 89, 2], [23, 653, 2], [23, 713, 6],
		[24, 637, 2], [24, 689, 2],
	];
	let sum = 0;
	for (let i = 0; i < overlayPages.length; i++) {
		if (volNo == overlayPages[i][0]) {
			if (page > overlayPages[i][1]) {
				sum += overlayPages[i][2];
			}
		}
	}
	return page + sum;
}

function checkInput(volNo, page) {
	if ((volNo >= G.volInfo.length) || (volNo < 1)) {
		alert("巻数には1〜" + (G.volInfo.length - 1) + "を指定してください。");
		return -1;
	}
	if ((G.volInfo[volNo][G.ENDPAGE] < page) || (page < 1)) {
		alert(volNo + "巻で指定可能なページ数は1〜" + G.volInfo[volNo][G.ENDPAGE] + "です。");
		return -1;
	}
	return 0;
}

function eraseTextEntry() {
	G.textEntry.value = "";
	G.textEntry.focus();
}

function erasePageEntry() {
	G.pageEntry.value = "";
	G.pageEntry.focus();
}

function windowOpen(url, title) {
	window.open(url, title);
	G.textEntry.focus();
}

function isElementFocused(elem) {
	return document.activeElement === elem && document.hasFocus();
}
