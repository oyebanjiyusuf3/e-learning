<?php
include('dbcon.php');
if (isset($_POST['backup_delete'])){
$get_id=$_GET['id'];
$id=$_POST['selector'];
$N = count($id);
for($i=0; $i < $N; $i++)
{
	$result = mysql_query("DELETE FROM class_quiz where class_quiz_id='$id[$i]'")or die(mysql_error());
}
?>
<script>
	window.location = "class_quiz.php<?php echo '?id='.$get_id; ?>"
</script>
<?php
}
?>