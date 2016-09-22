/**
 * ------------------------------------------------------------------
 * 接口地址--全局变量
 * ------------------------------------------------------------------
 */
const environment = 'http://temp.karakal.com.cn:18089';     //test
//const environment = 'http://media.karakal.com.cn:18089';      //formal
//const environment = 'http://i.karakal.com.cn:18089/';      //jidi
/*搜索接口*/
//const search_url = 'http://media.karakal.com.cn:18089/MKMusicSeaerch/';	//formal
const search_url = 'http://192.168.1.144:17063/MKMusicSeaerch/';	//test
/*媒资库素材接口*/
//const http_url =  'http://temp.karakal.com.cn:18089/new/mzk-cms';   //test-before
const http_url = environment + '/api';
//const http_url = 'http://192.168.2.203:19088/mzk-cms';  //本地
//标签歌曲接口
const http_tag_url = environment + '/webcpx/';
//const http_tag_search_list_url = 'http://media.karakal.com.cn:18089/api/listByIds/';
/*合并接口*/
const merge_url = environment + '/DataMergeNew/dataMerge/merge';      //test
/*音乐试听地址*/
// const listen_url = 'http://218.200.230.40:18089/catalog/productioncatalog!getCopyrightPlayList.action';
const listen_url = http_url + '/playlist/copyright.json';
//http://192.168.1.144:17080
/*数据列表接口*/
const list_url = http_url + '/listByIds/';
/*数据更新接口*/
//const update_url = 'http://192.168.1.221:8880/update/';
const update_url = http_url + '/update/';
const save_url = http_url + '/save/';
/*数据详情接口*/
const detail_url = http_url + '/info/';
/*数据审核接口*/
const http_audit = http_url + '/audit/';
/*数据抽查接口*/
const http_check = http_url + '/check/';
/*标签接口*/
const tag_url = http_url + '/tag/simple/';
const tag_url_new = http_tag_url + '/tag/simple/';
/*标签模板*/
const tag_muban = http_url + '/tag/all/';
/*标签关联关系*/
const rel_tags = http_url + '/tag/reltags/';
const rel_tags_new = http_tag_url + '/mzktag/';
/*标签更新*/
const urel_tags = http_url + '/tag/ureltags/';
/*获取图片接口*/
const img_url = http_url + '/img/';
/*获取专辑歌曲列表接口*/
const data_list_url = http_url + '/subs/';
/*图片上传接口*/
const img_upload_url = http_url + '/uimg/';
/*查询源网站数据ID接口*/
const source_id = http_url + '/ms/all/';
/*查询歌单详情的歌曲列表*/
const song_form_list_mls = http_url + '/listBySiteIds';
/*根据输入获取数据字典的接口*/
const dictionary_url = http_url + '/dictionary/';
/*获取同歌组列表信息*/
const same_song_group = http_url + '/songGroup/query/';
/*获取歌曲的版权列表*/
const song_copy_list = http_url + '/karakalcopyright/findKarakalCopyrightsByObject.json';
/*素材编辑页面操作记录*/
const operating_history = http_url + '/operationLog';
/*抽查记录*/
const CHECK_RECORD = http_url + '/check/query.json';
/*歌词接口*/
const song_lrc = http_url + '/lyric/queryBySongId/';
/*获取编辑权限*/
const edit_auth = http_url + '/edit';
/*获取数据锁定状态*/
const data_lock_status = http_url + '/tasks/queryTaskLockByIds/';
const img_r_url = 'http://i.karakal.com.cn:18089' + '/mzkimg/';  //图片服务器
/*改变数据状态*/
const CHANGEDATASTATUS = http_url + '/save/status/';
/*合并数据新接口*/
const MERGE_NEW = http_url + '/merge/';
/*批量审核接口*/
const AUDITBATCH = http_url + '/auditBatch.json';
/*批量修改接口*/
const BATCHUPDATE = http_url + '/batch/update/';
/*代理请求接口*/
const PROXY_API = http_url + '/img/handler.json';
/**
 * ------------------------
 * 搜索接口-全文检索
 * ------------------------
 */
const _search_url = environment + '/cmssearch/1/';
//const _search_url = "http://temp.karakal.com.cn:18089/new/mzk-search/1/";
//const _search_url = "http://192.168.2.203:8080/1/";
const _search_artist = _search_url + 'search/artist.json';
const _search_album = _search_url + 'search/album.json';
const _search_song = _search_url + 'search/song.json';
const SEARCH_PRECATALOG = _search_url + 'preCopyright/search.json';  //预编目工单搜索
const SEARCH_CLEAREXCEL = _search_url + 'checksearch/resetCkUser.json'; //清空上传的excel搜索

/**
 * ------------------------
 * 用户中心接口
 * ------------------------
 */
/*git获取用户*/
const git_api = 'http://git.karakal.com.cn:8090/api/v3/';
const git_user = git_api + 'users?per_page=500';
const git_user_single = git_api + 'user?private_token=';
/*接口地址*/
//const uc_url = 'http://127.0.0.1:8080/uc/'                //local
//const uc_url = 'http://192.168.2.157:8080/uc/';           //叶 ip
const uc_url = environment + '/uc/';
//const uc_url = 'http://temp.karakal.com.cn:18089/new/mzk-uc/';
/*新歌项目接口*/
const uc_task_new_song = uc_url + 'new/';
/*保存项目*/
const uc_save_p = uc_task_new_song + 'saveProject';
/*查询项目*/
const uc_find_p = uc_task_new_song + 'findProject';
/*添加任务*/
const uc_save_t = uc_task_new_song + 'saveTask';
/*指派任务*/
const uc_assign_t = uc_task_new_song + 'assignTask';
/*查询任务*/
const uc_find_t = uc_task_new_song + 'findTask';
/*提交任务*/
const uc_post_t = uc_task_new_song + 'postTask';
/*获取用户权限*/
const uc_auth = uc_url + 'auth/getAuthByUId.json';
/*上传excel文件*/
const uc_uploadexcel = uc_task_new_song + 'batchAddTask.json';
/*获取角色列表*/
const uc_role = uc_url + 'auth/getRoleById.json';
/*向角色添加用户*/
const uc_adduser2role = uc_url + 'auth/addRoleToUsers.json';
/*获取角色的所有用户*/
const uc_role_users = uc_url + 'auth/getUserByRoleId.json';
/*删除角色下的用户*/
const uc_role_deluser = uc_url + 'auth/delUsersFomRole.json';
/*获取所有的权限接口*/
const uc_allauth = uc_url + 'auth/findChildAuthByPId.json';
/*删除角色*/
const uc_delRole = uc_url + 'auth/delRole.json';
/*新增角色*/
const uc_saveRole = uc_url + 'auth/saveRole.json';
/*根据用户获取用户的角色*/
const uc_user_role = uc_url + 'auth/getRoleByUId.json';
/*角色增删改对应的权限*/
const uc_role_addauth = uc_url + 'auth/addAuthToRoles.json';
/*查询角色对应的权限*/
const uc_role_auth = uc_url + 'auth/findAuthByRoleId.json';
/*新歌查询版权接口*/
const uc_new_song = _search_url + "search/task/";
/*获取自定义权限分配模板*/
const uc_new_song_auth = uc_task_new_song + "getFlowByPid.json";


const git_user_url = "http://git.karakal.com.cn:8090/api/v3/";
/*git获取全部用户*/
const git_get_all_user = git_user_url + "users.json?callback=JSON_CALLBACK&";
/*临时展示demo界面*/
const demo_url = http_tag_url + "t/";
/*标签树接口*/
//const tag_tree_url = 'http://192.168.2.251:8080/tags.templet/'; //junde.jia
//const tag_tree_url = 'http://127.0.0.1:9080/tags.templet/'; //local
const tag_tree_url = environment + '/tagTree/';
// const tag_tree_url = 'http://192.168.3.166:18890/tagTree/';             // test

/**
 * ------------------------
 * 歌单管理接口
 * ------------------------
 */
const song_form_url = environment + '/revcpx';
/*歌单列表*/
const song_form_list = song_form_url + '/pl/ls/';
/*歌单详情*/
const song_form_detail = song_form_url + '/pl/info/';
/*标签歌曲*/
const song_form_tag = environment + '/revcpx/t/song/ls.json';
/**
 * ------------------------
 * 缺歌系统接口
 * ------------------------
 */
//const song_lack_url = 'http://192.168.2.150:8080/qg/';
const song_lack_url = environment + '/qg/';
/*查询缺歌列表*/
const song_lack_search = song_lack_url + 'findQg.json';
/*编辑缺歌*/
const song_lack_edit = song_lack_url + 'saveQg.json';
/*导入缺歌excel*/
const song_lack_import = song_lack_url + 'batchAddQg.json';
/*下载模板*/
const song_lack_model = song_lack_url + 'resources/excel/moban.xls';
/*导出excel*/
const song_lack_export = song_lack_url + 'el/excel';
/*删除缺歌列表的歌曲*/
const song_lack_del = song_lack_url + 'delQg.json';
/**
 * ------------------------
 * 统计报表--抓取监控
 * ------------------------
 */
const charts_catch_url = environment + '/s2/';
const charts_catch_monitor = charts_catch_url + 'stat/status.json';
const charts_catch_monitor_all = charts_catch_url + 'stat/statusTotal.json';
const charts_catch_url_all = environment + '/s1/';
const charts_catch_all = charts_catch_url_all + 'stat/total.json';
/**
 * ------------------------
 * 统计报表--艺人报表统计
 * ------------------------
 */
const charts_artist_url = environment + '/s3/';
const charts_artist_tag = charts_artist_url + 'artist/tagDistribution.json';
const charts_artist_data = charts_artist_url + 'artist/tag2Artists.json';
/**
 * ------------------------
 * 编辑界面标签关联
 * ------------------------
 */
/*查询关联标签*/
const tag_edit_reltags = http_tag_url + 'mzktag/reltags/';
/*编辑数据标签*/
const tag_update_reltags = http_tag_url + 'mzktag/ureltags/';
/*给一个素材增加标签*/
const tag_add_reltags = http_tag_url + 'mzktag/areltags/';
/**
 * ------------------------
 * 编辑界面新版标签关联
 * ------------------------
 */
const tag_edit_new = http_url + '/tagRel/';
const tag_edi_new_update = tag_edit_new + 'update/';
const tag_edit_new_query = tag_edit_new + 'query/';
const TAG_EDIT_NEW_CHECK = tag_edit_new + 'edit/'; //查询打标签权限

/**
 * ------------------------
 * 新增榜单接口
 * ------------------------
 */
const top_karakal_multiple = charts_artist_url + 'hotlistAll.json';
const top_karakal_new = charts_artist_url + 'newHotList.json';
/**
 * ------------------------
 * 曲库接口
 * ------------------------
 */
const qk_url = 'http://218.200.230.40:18089';
/*获取版权列表*/
const copyrightId_url = qk_url + '/tyqk-service/1/fcatalog.json';
const copyright_list = qk_url + '/product-api/all';
/**
 * ------------------------
 * 编目接口
 * ------------------------
 */
const catalog_url = http_url + '/karakalcopyright';//test
const catalog_search = http_url + '/listByIds/copyright.json';
const catalog_update = environment + '/catalog/updateKarakalCopyright/';
//获取版权数据详情
const catalog_info = catalog_url + '/info/';
const catalog_copyurl = 'http://192.168.2.229:8080/SyncProduct';//test
const catalog_copyinfo = catalog_copyurl + '/getProductByCopyrightId';
//获取彩振全随版权接口
//const catalog_copy_url = 'http://218.200.230.40:18089/ProductIF/cms/CMSServlet';//外网
//const catalog_copy_zqsc = catalog_copy_url + '?method=synCMSinfo';
const catalog_copy_zqsc = copyright_list + '/latest';
//编目审核
const catalog_check = http_url + '/audit/cp/';
//编目搜索接口
const catalog_seach_all = _search_url + 'search/copyright.json';
//审核界面编目记录列表
const CATALOG_HEADER = environment + '/catalog';
const catalog_list = CATALOG_HEADER + '/findKarakalCopyrightsByObject.json';
const CATALOG_CREATESONGREL = CATALOG_HEADER + '/createSongRel/';
/*预编目工单接口*/
const CATALOG_DELETE = CATALOG_HEADER + '/deleteMultiCatalogPre.json';  //删除编目记录
const CATALOG_EMERGIMPORT = CATALOG_HEADER + '/importExcel/catalogPre.json'; //编目紧急歌曲导入
const CATALOG_EMERGTPL = CATALOG_HEADER + '/importExcel/catalogPre/template.json'; //预编目工单紧急歌曲导入模板下载
const CATALOG_IMPORT = _search_url + 'preCopyright/exlQuery.json'; //预编目导入查询
const CATALOG_EXPORT = _search_url + 'preCopyright/export.json';  //预编目导出excel
const CATALOG_CREATE = CATALOG_HEADER + '/createCatalogPre.json'; //创建预编目数据
const CATALOG_GETPRE = CATALOG_HEADER + '/getCatalogPre/'; //获取预编目ID
const CATALOG_CREATETASK = CATALOG_HEADER + '/createCatalogTask.json'; //创建编目工单任务
const CATALOG_CONFIRM = CATALOG_HEADER + '/forceComplete.json'; //未完成状态强制确认
/**
 * ------------------------
 * 评论接口
 * ------------------------
 */
/*通过excel序号查询源网站歌曲*/
const comment_song_excelid = http_url + '/comment/query/';
/*查询已保存的评论列表*/
const comment_saved_list = http_url + '/comment/list/';
/*保存评论*/
const comment_save = http_url + '/comment/save/';
/*删除保存的评论*/
const comment_delete = http_url + '/comment/delete/';
/*导出评论列表*/
const comment_export = http_url + '/comment/export/';

const comment_url = environment + '/mzk-capture-service/';
/*查询所有的评论*/
const comment_all = comment_url + '1/comment/query/';
/*所有评论的总数*/
const comment_all_count = comment_url + '1/comment/count/';

/**
 * ------------------------
 * 优质内容接口
 * ------------------------
 */
const quality_url = environment + '/grade/';      //test
const quality_artist = quality_url + 'artist.json?data=';   //优质艺人查询
const quality_album = quality_url + 'album.json?data=';     //优质专辑查询
const quality_song = quality_url + 'song.json?data=';       //优质歌曲查询
const quality_artist_export = quality_url + 'export/artist.do?data=';       //优质艺人导出
const quality_album_export = quality_url + 'export/album.do?data=';         //优质专辑导出
const quality_song_export = quality_url + 'export/song.do?data=';           //优质歌曲导出
const quality_location = tag_tree_url + 'getSonTagsByFatherID.do?fatherId=1002598731&materialType=1';      //地域标签接口
const quality_import_excel = quality_url + 'import/';
const quality_delete = quality_url + 'delete/';
const quality_tyqk = 'http://i.karakal.com.cn:18089/reverseif/';

/**
 * 榜单接口
 */
//const top_list = "http://192.168.1.144:17086/toplist/";
const top_list = environment + '/toplist/';
//const top_list = 'http://i.karakal.com.cn:18089' + '/toplist/';
const top_list_tops = top_list + "tops.json";
const top_list_info = top_list + "info/";
const top_list_download = top_list + "export.do";

/**
 * ------------------------
 * 审核项目接口
 * ------------------------
 */
const examine_search = _search_url + 'search/audit/';
const examine_song_search = examine_search + 'song.json';
const examine_album_search = examine_search + 'album.json';
const examine_artist_search = examine_search + 'artist.json';

/**
 * ----------------------
 * 专项库
 * ----------------------
 */
const special_data = environment + '/special/';
/**
 * ----------------------
 * 垃圾库
 * ----------------------
 */
const waste_data = environment + '/trash/';

/**
 * ------------------------
 * 单独打标签页面接口
 * ------------------------
 */
const tag_alone_tree = tag_tree_url + 'getTagsByMaterialAndUser.do';

/**
 * ------------------------
 * 抽查同步
 * ------------------------
 */
const check_sync = environment + "/checkSync/";
const check_sync_add = check_sync + "add.json";

/**
 * ------------------------
 * 拆分页面接口
 * ------------------------
 */
const MDPFACE_URL = environment + '/mdpface/api/1/';
const SEPARATE_CONFIRM = MDPFACE_URL + 'updaterelation.json';
const SEPARATE_SEARCH = MDPFACE_URL + 'getrelation/';
const SEPARATE_SOURCE = 'http://media.karakal.com.cn:18089/mzk-capture-service/';
const CATCH_URL = 'http://media.karakal.com.cn:18089/cc217/1/captureUrl.json';
/**
 * ------------------------
 * 歌曲标签工单接口
 * ------------------------
 */
const SONGTAG_EXPORT = _search_url + 'taskExport/tagTask.do'; //导出
const SONGTAG_IMPORT = http_url + '/tag/task/upload.json'; //工单导入接口
/**
 * ------------------------
 * 数据字典接口
 * ------------------------
 */
const DICTIONARY_SEARCH = http_url + '/data/search/';   //字典搜索接口
const DICTIONARY_SAVE = http_url + '/data/save/';       //字典保存接口
const DICTIONARY_DELETE = http_url + '/data/delete/';   //字典删除接口
/**
 * ----------------
 * 定时任务接口
 * ----------------
 */
const REGULAR_URL = environment + '/schedule/ftpTask/';
/**
 * ----------------
 * 精品标签接口
 * ----------------
 */
const QUALITY_TAG = environment + "/boutiquetag/";
const QUALITY_TAG_QUERY = QUALITY_TAG + "query.json";
const QUALITY_TAG_AUDIT = QUALITY_TAG + "audit.json";
const QUALITY_TAG_EXPORT = QUALITY_TAG + "query/export.json";
const QUALITY_TAG_ORDER = QUALITY_TAG + "order/";
const QUALITY_TAG_PUSH = QUALITY_TAG + "TagSearch/getSongByTagName";
/**
 * ------------------------
 * 上传模板地址
 * ------------------------
 */
const UPLOAD_TPL = environment + '/cmssearch/resources/excel/';
const SONGTAG_TPL = UPLOAD_TPL + 'task-songtag-distribution.xlsx';
const ARTIST_TPL = UPLOAD_TPL + 'artist-distribution.xlsx';
const ALBUM_TPL = UPLOAD_TPL + 'album-distribution.xlsx';
const TAG_TPL = UPLOAD_TPL + 'task-songtag-handle.xlsx';
//统一跨域callback参数
const CALLBACK = 'callback=JSON_CALLBACK';


const atags_url = environment + '/webcpx/';
//const atags_url = "http://127.0.0.1:8080/";
