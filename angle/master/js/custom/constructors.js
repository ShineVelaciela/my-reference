/**
 * Created by hao.cheng on 2016/7/28.
 * Desc: store all common constructors
 */
/**
 * post请求设置父类构造函数
 * @param url 请求地址
 * @param data 请求携带参数
 * @constructor
 */
function PostSetup(url, data) {
    this.method = 'POST';
    this.url = url;
    this.data = data;
    this.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
}
/**
 * 统一表单对象父类构造函数
 * @constructor
 */
function Form() {
    this.pageSize = 100;
    this.pageNo = 1;
}
/**
 * SweetAlert 统一设置类
 * @constructor
 */
function SweetAlertSetup(msg1, msg2, type) {
    this.title = msg1;
    this.text = msg2;
    this.type = type;
    this.confirmButtonText = '确认!';
    this.closeOnConfirm = true;
    if(type == 'success') this.timer = 1200; //成功自动关闭提示框
}
/**
 * 容器类构造函数
 * @param title     容器标题
 * @param head      容器头部内容
 * @param body      容器身体内容
 * @constructor
 */
function Container(title, head, body){
    this.title = title;
    this.head = head ? head : {show: true};
    this.body = body ? body : {show: true};
}
function BaseAjax(url, success, error) {
    this.url = url;
    this.beforeSend = function (request) {  //token认证
        request.setRequestHeader('Authorization', JSON.parse(localStorage.getItem('ngStorage-token')));
    };
    this.type = 'post';
    this.success = success;
    this.error = error;
    this.dataType = 'json';
}
/**
 * jquery使用ajax同步公用类
 * @param url
 * @param success   成功回调
 * @param error     失败回调
 * @constructor
 */
function JqueryAjax(url, success, error){
    BaseAjax.call(this, url, success, error);
    this.async = false;
}
function JqueryAjaxFileUpload(url, fileName, success, error) {
    BaseAjax.call(this, url, success, error);
    this.secureuri = false;           //一般设置为false
    this.fileElementId = fileName;     // 上传文件的id、name属性名
}