/**
 * Created by kiracheng on 2016/5/20.
 */
var file_type = document.location.href.substring(7,document.location.href.indexOf('.'));
console.log(file_type);
if(file_type == 'media'){
    document.write('<script src="app/js/constants_m.js"></script>');
}else if(file_type == 'i'){
    document.write('<script src="app/js/constants_i.js"></script>');
}else{
    document.write('<script src="app/js/constants_t.js"></script>');
}
