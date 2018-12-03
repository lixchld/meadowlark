var fortuneCookies = [
    "Conquer your fears or they will conquer you",
    "Rivers need springs.",
    "Do not fear what your don't know.",
    "You will have a pleasant surprise.",
    "Whenver possible, keep it simple.",
];

exports.getFortune = function(){
    var idx = Math.floor( Math.random() * fortuneCookies.length);
    return fortuneCookies[idx];
};