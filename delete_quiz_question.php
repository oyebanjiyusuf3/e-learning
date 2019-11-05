<?php
include('dbcon.php');
if (isset($_POST['backup_delete'])){
$id=$_POST['selector'];
$get_id=$_POST['get_id'];
$N = count($id);
for($i=0; $i < $N; $i++)
{
	$result = mysql_query("DELETE FROM quiz_question where quiz_question_id='$id[$i]'");
}
?>
<script>
	window.location = 'quiz_question.php<?php echo '?id='.$get_id ?>';
</script>
<?php
}
?>