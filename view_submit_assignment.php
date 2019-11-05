<?php include('header_dashboard.php'); ?>
<?php include('session.php'); ?>
<?php $get_id = $_GET['id']; ?>
<?php 
	  $post_id = $_GET['post_id'];
	  if($post_id == ''){
	  ?>
		<script>
		window.location = "assignment_student.php<?php echo '?id='.$get_id; ?>";
		</script>
	  <?php
	  }
	
 ?>
 

    <body id="studentTableDiv">
		<?php include('navbar_teacher.php'); ?>
        <div class="container-fluid">
            <div class="row-fluid">
				<?php include('assignment_link.php'); ?>
                <div class="span9" id="content">
                     <div class="row-fluid">
					   
					   <!-- breadcrumb -->
				
										<?php $class_query = mysql_query("select * from teacher_class
										LEFT JOIN class ON class.class_id = teacher_class.class_id
										LEFT JOIN subject ON subject.subject_id = teacher_class.subject_id
										where teacher_class_id = '$get_id'")or die(mysql_error());
										$class_row = mysql_fetch_array($class_query);
										?>
				
					     <ul class="breadcrumb">
							<li><a href="#"><?php echo $class_row['class_name']; ?></a> <span class="divider">/</span></li>
							<li><a href="#"><?php echo $class_row['subject_code']; ?></a> <span class="divider">/</span></li>
							<li><a href="#">School Year: <?php echo $class_row['school_year']; ?></a> <span class="divider">/</span></li>
							<li><a href="#"><b>Uploaded Assignments</b></a></li>
						</ul>
						 <!-- end breadcrumb -->
						
						
                        <!-- block -->
                        <div id="block_bg" class="block">
                            <div class="navbar navbar-inner block-header">
                                <div id="" class="muted pull-right"><a href="assignment.php<?php echo '?id='.$get_id; ?>"><i class="icon-arrow-left"></i> Back</a></div>
                            </div>
                            <div class="block-content collapse in">
                                <div class="span12">
									<?php
										$query1 = mysql_query("select * FROM assignment where assignment_id = '$post_id'")or die(mysql_error());
										$row1 = mysql_fetch_array($query1);
									
									?>
									<div class="alert alert-info">Submit Assignment in : <?php echo $row1['fname']; ?></div>
									
									<div id="">
  											
												
				<table cellpadding="0" cellspacing="0" border="0" class="table" id="">
						
										<thead>
										        <tr>
												<th>Date Upload</th>
												<th>File Name</th>
												<th>Description</th>
												<th>Submitted by:</th>
												<th></th>
												<th></th>
												</tr>
												
										</thead>
										<tbody>
											
                              		<?php
										$query = mysql_query("select * FROM student_assignment 
										LEFT JOIN student on student.student_id  = student_assignment.student_id
										where assignment_id = '$post_id'  order by assignment_fdatein DESC")or die(mysql_error());
										while($row = mysql_fetch_array($query)){
										$id  = $row['student_assignment_id'];
									?>                              
										<tr>
										 <td><?php echo $row['assignment_fdatein']; ?></td>
                                         <td><?php  echo $row['fname']; ?></td>
                                         <td><?php echo $row['fdesc']; ?></td>                                                                        
                                         <td><?php echo $row['firstname']." ".$row['lastname']; ?></td>                                                                        
                                         <td><a href="<?php echo $row['floc']; ?>"><i class="icon-download icon-large"></i></a></td>                                                                        
                                         <td width="140">
										 <form method="post" action="save_grade.php">
										 <input type="hidden" class="span4" name="id" value="<?php echo $id; ?>">
										 <input type="hidden" class="span4" name="post_id" value="<?php echo $post_id; ?>">
										 <input type="hidden" class="span4" name="get_id" value="<?php echo $get_id; ?>">
										 <input type="text" class="span4" name="grade" value="<?php echo $row['grade']; ?>">
										 <button name="save" class="btn btn-success" id="btn_s"><i class="icon-save"></i> Save</button>
										 </form>
										 </td>                                                                        
                                </tr>
                         
						 <?php } ?>
					
                              
										</tbody>
									</table>
									</div>
								
                                </div>
                            </div>
                        </div>
                        <!-- /block -->
                    </div>


                </div>

				
            </div>
		<?php include('footer.php'); ?>
        </div>
		<?php include('script.php'); ?>
    </body>
</html>