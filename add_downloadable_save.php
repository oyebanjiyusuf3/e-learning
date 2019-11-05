<?php

include('session.php');
//Include database connection details
require("opener_db.php");
$errmsg_arr = array();
//Validation error flag
$errflag = false;

$uploaded_by_query = mysqli_query($conn,"select * from teacher where teacher_id = '$session_id'")or die(mysqli_error());
$uploaded_by_query_row = mysqli_fetch_array($uploaded_by_query);
$uploaded_by = $uploaded_by_query_row['firstname']."".$uploaded_by_query_row['lastname'];

/* $id_class=$_POST['id_class']; */
$name=$_POST['name'];





//Function to sanitize values received from the form. Prevents SQL injection
function clean($str) {
    $str = @trim($str);
    if (get_magic_quotes_gpc()) {
        $str = stripslashes($str);
    }
    return mysqli_real_escape_string($str);
}

//Sanitize the POST values
$filedesc = clean($_POST['desc']);
//$subject= clean($_POST['upname']);

if ($filedesc == '') {
    $errmsg_arr[] = ' file discription is missing';
    $errflag = true;
}

if ($_FILES['uploaded_file']['size'] >= 1048576 * 5) {
    $errmsg_arr[] = 'file selected exceeds 5MB size limit';
    $errflag = true;
}


//If there are input validations, redirect back to the registration form
if ($errflag) {
    $_SESSION['ERRMSG_ARR'] = $errmsg_arr;
    session_write_close();
	?>

   <script>
   window.location = 'downloadable.php<?php echo '?id='.$get_id;  ?>';
   </script>
   <?php exit();
}
//upload random name/number
$rd2 = mt_rand(1000, 9999) . "_File";

//Check that we have a file
if ((!empty($_FILES["uploaded_file"])) && ($_FILES['uploaded_file']['error'] == 0)) {
    //Check if the file is JPEG image and it's size is less than 350Kb
    $filename = basename($_FILES['uploaded_file']['name']);

    $ext = substr($filename, strrpos($filename, '.') + 1);

    if (($ext != "exe") && ($_FILES["uploaded_file"]["type"] != "application/x-msdownload")) {
        //Determine the path to which we want to save this file
        //$newname = dirname(__FILE__).'/upload/'.$filename;
        $newname = "admin/uploads/" . $rd2 . "_" . $filename;
		$name_notification  = 'Add Downloadable Materials file name'." ".'<b>'.$name.'</b>';
        //Check if the file with the same name is already exists on the server
        if (!file_exists($newname)) {
            //Attempt to move the uploaded file to it's new place
            if ((move_uploaded_file($_FILES['uploaded_file']['tmp_name'], $newname))) {
                //successful upload
                // echo "It's done! The file has been saved as: ".$newname;

							$id=$_POST['selector'];
											$N = count($id);
											for($i=0; $i < $N; $i++)
											{

               /*  $qry2 = "INSERT INTO files (fdesc,floc,fdatein,teacher_id,class_id,fname,uploaded_by) VALUES ('$filedesc','$newname',NOW(),'$session_id','$id[$i]','$name','$uploaded_by')"; */
				mysqli_query($conn,"INSERT INTO files (fdesc,floc,fdatein,teacher_id,class_id,fname,uploaded_by) VALUES ('$filedesc','$newname',NOW(),'$session_id','$id[$i]','$name','$uploaded_by')");
				mysqli_query($conn,"insert into notification (teacher_class_id,notification,date_of_notification,link) value('$id[$i]','$name_notification',NOW(),'downloadable_student.php')")or die(mysqli_error());

			  }

}
}
}
}

/* mysql_close(); */
?>
