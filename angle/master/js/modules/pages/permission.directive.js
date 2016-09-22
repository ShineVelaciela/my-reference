/**
 * Created by Administrator on 2016/5/23.
 */

angular.module('app.pages').directive('hasPermission', function(permissions) {     //根据权限字符串对页面元素进行显示和隐藏
    return {
        link: function(scope, element, attrs) {

            var value = attrs.hasPermission.trim();
            var notPermissionFlag = value[0] === '!';
            if(notPermissionFlag) {
                value = value.slice(1).trim();
            }

            function toggleVisibilityBasedOnPermission() {
                var hasPermission = permissions.hasPermission(value);

                if(hasPermission && !notPermissionFlag || !hasPermission && notPermissionFlag)
                    $(element).show();
                else
                    $(element).hide();
            }
            toggleVisibilityBasedOnPermission();
            scope.$on('permissionsChanged', toggleVisibilityBasedOnPermission);
        }
    };
});