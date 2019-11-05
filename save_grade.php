<?php
include('admin/dbcon.php');

$id = $_POST['id'];
$post_id = $_POST['post_id'];
$get_id = $_POST['get_id'];
$grade = $_POST['grade'];
mysql_query("update student_assignment set grade = '$grade' where student_assignment_id = '$id'")or die(mysql_error());
?>
<script>
 window.location = 'view_submit_assignment.php<?php echo '?id='.$get_id.'&'.'post_id='.$post_id; ?>'; 
</script>